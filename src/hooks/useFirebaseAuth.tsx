import {
  GoogleAuthProvider,
  FacebookAuthProvider,
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
  const [isLoading, setIsLoading] = useState<boolean>(true);

  /**
   * ログイン処理
   * @returns ログインしたユーザー情報
   */
  const handleFacebookLogin = async () => {
    // TODO Facebookログイン処理
    var clientId = process.env.REACT_APP_FB_CLIENT_ID;
    var clientSecret = process.env.REACT_APP_FB_CLIENT_SECRET;
    const redirectURL = chrome.identity.getRedirectURL();

    setIsLoading(true);

    const options = {
      interactive: true,
      // url:'https://graph.facebook.com/oauth/access_token?client_id=' + clientId +
      url:'https://www.facebook.com/dialog/oauth?client_id=' + clientId +
          '&reponse_type=token' +
          '&access_type=online' +
          '&redirect_uri=' + encodeURIComponent(redirectURL)
    }
    chrome.identity.launchWebAuthFlow(options, function(redirectUri) {
      if (chrome.runtime.lastError) {
        console.error("lastError:", chrome.runtime.lastError);
        setIsLoading(false);
      } else {
        console.log("redirectUri", redirectUri);
      }
    });
  };

  /**
   * Facebookログイン処理
   * @returns ログインしたユーザー情報
   */
  const handleGoogleLogin = async () => {

    setIsLoading(true);
    chrome.identity.getAuthToken({ interactive: true }, (token: string) => {
      if (chrome.runtime.lastError) {
        console.error("lastError:", chrome.runtime.lastError);
        setIsLoading(false);
      } else if (token) {
        console.log("token", token);
        
        const credential = GoogleAuthProvider.credential(null, token);
        // const credential = FacebookAuthProvider.credential(token);
        const provider = new GoogleAuthProvider();
        signInWithCredential(auth, credential)
        // signInWithRedirect(auth, provider)
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
      setIsLoading(true);

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

      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  return {
    user,
    isLoading,
    // error,
    login: handleGoogleLogin,
    logout: handleLogout,
  };
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const auth = useFirebaseAuth();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);