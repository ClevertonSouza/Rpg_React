import { useEffect, useRef, useState } from 'react';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { defaultCharacter } from '../data/defaultCharacter';

const DEBOUNCE_MS = 1500;

export function useCharacterData(userId, characterId) {
  const [char, setCharState] = useState(defaultCharacter);
  const [synced, setSynced] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!userId || !characterId) return;

    const ref = doc(db, 'users', userId, 'characters', characterId);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const data = snap.data().character;
        if (data) setCharState(data);
      }
      setSynced(true);
    });

    return () => unsub();
  }, [userId, characterId]);

  const setChar = (newChar) => {
    setCharState(newChar);
    if (userId && characterId) {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const ref = doc(db, 'users', userId, 'characters', characterId);
        setDoc(ref, { name: newChar.name, character: newChar, updatedAt: serverTimestamp() }, { merge: true });
      }, DEBOUNCE_MS);
    }
  };

  const resolvedSynced = (userId && characterId) ? synced : false;
  return [char, setChar, resolvedSynced];
}
