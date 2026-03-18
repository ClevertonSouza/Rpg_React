import { useEffect, useState } from 'react';
import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { defaultCharacter } from '../data/defaultCharacter';

export function useCharacterList(userId) {
  const [characters, setCharacters] = useState([]);
  // Track which userId has already delivered its first snapshot
  const [loadedForUser, setLoadedForUser] = useState(null);

  useEffect(() => {
    if (!userId) return;

    const ref = collection(db, 'users', userId, 'characters');
    const unsub = onSnapshot(ref, (snap) => {
      const list = snap.docs.map(d => ({
        id: d.id,
        name: d.data().name ?? d.data().character?.name ?? 'Personagem',
        updatedAt: d.data().updatedAt?.toDate?.() ?? null,
      }));
      list.sort((a, b) => (b.updatedAt?.getTime() ?? 0) - (a.updatedAt?.getTime() ?? 0));
      setCharacters(list);
      setLoadedForUser(userId);
    });

    return () => unsub();
  }, [userId]);

  const createCharacter = async (name) => {
    const trimmed = name.trim() || 'Novo Personagem';
    const ref = collection(db, 'users', userId, 'characters');
    const docRef = await addDoc(ref, {
      name: trimmed,
      character: { ...defaultCharacter, name: trimmed },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  };

  const deleteCharacter = async (characterId) => {
    const ref = doc(db, 'users', userId, 'characters', characterId);
    await deleteDoc(ref);
  };

  return {
    characters: userId ? characters : [],
    loading: !!userId && loadedForUser !== userId,
    createCharacter,
    deleteCharacter,
  };
}
