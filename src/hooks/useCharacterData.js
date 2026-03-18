import { useEffect, useRef, useState } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { defaultCharacter } from '../data/defaultCharacter';

const LS_KEY = 'lorian_sheet_v2';
const DEBOUNCE_MS = 1500;

function loadFromLS() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : defaultCharacter;
  } catch {
    return defaultCharacter;
  }
}

function saveToLS(data) {
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}

/**
 * When user is logged in: syncs the character to Firestore.
 * When offline / not logged in: falls back to localStorage.
 *
 * Strategy:
 *  - On mount (logged in): subscribe to Firestore document; on first snapshot, if empty write locals
 *  - Every save: debounce write to Firestore + always write to LS as cache
 */
export function useCharacterData(userId) {
  const [char, setCharState] = useState(loadFromLS);
  const [synced, setSynced] = useState(false);
  const debounceRef = useRef(null);
  const isFirstSnap = useRef(true);

  // Subscribe to Firestore when logged in
  useEffect(() => {
    if (!userId) {
      setSynced(false);
      isFirstSnap.current = true;
      return;
    }

    const ref = doc(db, 'characters', userId);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const data = snap.data().character;
        if (data) {
          setCharState(data);
          saveToLS(data);
        }
      } else if (isFirstSnap.current) {
        // No cloud doc yet — upload what we have in LS
        const local = loadFromLS();
        setDoc(ref, { character: local });
      }
      isFirstSnap.current = false;
      setSynced(true);
    });

    return () => unsub();
  }, [userId]);

  const setChar = (newChar) => {
    setCharState(newChar);
    saveToLS(newChar);

    if (userId) {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const ref = doc(db, 'characters', userId);
        setDoc(ref, { character: newChar });
      }, DEBOUNCE_MS);
    }
  };

  return [char, setChar, synced];
}
