import { PerspectiveCamera } from '@react-three/drei';

export function FoundationCamera() {
  return <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={45} near={0.1} far={100} />;
}
