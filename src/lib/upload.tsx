import firebaseApp from "@/lib/firebase";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const storage = getStorage(firebaseApp, "gs://ripplez-blog.appspot.com");

export default async function handleImageSaveToFireBase(
  file: File,
  onProgress?: (percent: number) => void
): Promise<string> {
  const fileName = `${Date.now()}-${file.name}`;
  const storageRef = ref(storage, `escrow/${fileName}`);
  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise<string>((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        if (onProgress) {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress(Math.round(progress));
        }
      },
      (error) => reject(error),
      () => {
        getDownloadURL(uploadTask.snapshot.ref)
          .then((url) => resolve(url))
          .catch(reject);
      }
    );
  });
}