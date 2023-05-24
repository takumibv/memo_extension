import {
  GoogleAuthProvider,
  signInWithCredential,
  onAuthStateChanged,
  signOut,
} from "@firebase/auth";
import { doc, getDoc, setDoc } from "@firebase/firestore";
import React, { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../lib/firebase/client";
import { User } from "../types/User";

type UserContextType = User | null | undefined;

const AuthContext = createContext<{
    user?: UserContextType,
    isLoading?: boolean,
    // error,
    login?: () => void;
    logout?: () => void;
}>({});

// 参考 https://zenn.dev/nino_cast/books/43c539eb47caab/viewer/90a2a8
export default function useFirebaseAuth() {

  const [user, setUser] = useState<UserContextType>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  /**
   * ログイン処理
   * @returns ログインしたユーザー情報
   */
  const handleLogin = async () => {
    const interactive = true;

    setIsLoading(true);
    chrome.identity.getAuthToken({ interactive: !!interactive }, (token: string) => {
      if (chrome.runtime.lastError) {
        console.error("lastError:", chrome.runtime.lastError);
        setIsLoading(false);
      } else if (token) {
        const credential = GoogleAuthProvider.credential(null, token);
        signInWithCredential(auth, credential)
          .then(function (result: any) {
            console.log("userinfo: " + JSON.stringify(result.user));
          })
          .catch((error: any) => {
            console.log("error=>", error);
            if (error.code === "auth/invalid-credential") {
              chrome.identity.removeCachedAuthToken({ token: token }, function () {
                // startAuth(interactive);
              });
            }
          }).finally(() => {
            setIsLoading(false);
          });
      } else {
        console.error("The OAuth Token was null");
        setIsLoading(false);
      }
    });
  };

  const handleLogout = async () => {
    return await signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // ログインしていた場合、ユーザーコレクションからユーザーデータを参照
        const ref = doc(db, `users/${firebaseUser.uid}`);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          // ユーザーデータを取得して格納
          const appUser = (await getDoc(ref)).data() as User;
          setUser(appUser);
        } else {
          // ユーザーが未作成の場合、新規作成して格納
          const appUser: User = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName!,
            photoURL: firebaseUser.photoURL!,
            email: firebaseUser.email!,
            createdAt: Date.now(),
          };

          // Firestoreにユーザーデータを保存
          setDoc(ref, appUser).then(() => {
            // 保存に成功したらコンテクストにユーザーデータを格納
            setUser(appUser);
          });
        }
      } else {
        // ログインしていない場合、ユーザー情報を空にする
        setUser(null);
      }
    });

    return unsubscribe;
  }, []);

  return {
    user,
    isLoading,
    // error,
    login: handleLogin,
    logout: handleLogout,
  };
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const auth = useFirebaseAuth();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);