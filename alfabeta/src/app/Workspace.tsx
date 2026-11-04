import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
type Context = {
  schoolId: string;
  classroomId: string;
  studentId: string;
  start: string;
  end: string;
};
const empty: Context = { schoolId: '', classroomId: '', studentId: '', start: '', end: '' };
const State = createContext<{
  value: Context;
  update: (patch: Partial<Context>) => void;
  profession: 'guardian' | 'teacher';
  logout: () => void;
  profileChanged: () => Promise<void>;
}>({
  value: empty,
  update: () => {},
  profession: 'guardian',
  logout: () => {},
  profileChanged: async () => {},
});
export function WorkspaceProvider({
  account,
  profession,
  logout,
  profileChanged,
  children,
}: React.PropsWithChildren<{
  account: string;
  profession: 'guardian' | 'teacher';
  logout: () => void;
  profileChanged: () => Promise<void>;
}>) {
  const [value, setValue] = useState(empty);
  const touched = useRef(false);
  useEffect(() => {
    let alive = true;
    void AsyncStorage.getItem('eleva-workspace:' + account).then((raw) => {
      if (alive && raw && !touched.current) {
        try {
          setValue({ ...empty, ...JSON.parse(raw) });
        } catch {
          /* Ignore malformed UI preferences. */
        }
      }
    });
    return () => {
      alive = false;
    };
  }, [account]);
  function update(patch: Partial<Context>) {
    touched.current = true;
    setValue((current) => {
      const next = { ...current, ...patch };
      void AsyncStorage.setItem('eleva-workspace:' + account, JSON.stringify(next));
      return next;
    });
  }
  return (
    <State.Provider value={{ value, update, profession, logout, profileChanged }}>
      {children}
    </State.Provider>
  );
}
export const useWorkspace = () => useContext(State);
