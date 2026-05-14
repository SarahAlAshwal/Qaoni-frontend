import { IKContext } from "imagekitio-react";
import { useAuth0 } from "@auth0/auth0-react";
import { apiFetch } from "../services/api";

const IMAGEKIT_PUBLIC_KEY = import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY!;
const IMAGEKIT_URL_ENDPOINT = import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT!;

export const ImageKitProvider = ({ children }: { children: React.ReactNode }) => {
  const { getAccessTokenSilently } = useAuth0();

  const authenticator = async () => {
    const token = await getAccessTokenSilently();
    const res = await apiFetch("/api/imagekit/auth", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error("Failed to fetch ImageKit auth params");
    }

    return res.json();
  };

  return (
    <IKContext
      publicKey={IMAGEKIT_PUBLIC_KEY}
      urlEndpoint={IMAGEKIT_URL_ENDPOINT}
      authenticator={authenticator}
    >
      {children}
    </IKContext>
  );
};
