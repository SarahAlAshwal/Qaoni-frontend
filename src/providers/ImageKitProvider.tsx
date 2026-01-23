import { IKContext } from "imagekitio-react";

const IMAGEKIT_PUBLIC_KEY = import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY!;
const IMAGEKIT_URL_ENDPOINT = import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT!;

export const ImageKitProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <IKContext
      publicKey={IMAGEKIT_PUBLIC_KEY}
      urlEndpoint={IMAGEKIT_URL_ENDPOINT}
      authenticationEndpoint="/api/imagekit/auth"
    >
      {children}
    </IKContext>
  );
};
