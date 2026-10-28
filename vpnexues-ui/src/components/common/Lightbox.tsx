import YarlLightbox from 'yet-another-react-lightbox';
import { Captions } from 'yet-another-react-lightbox/plugins';
import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/captions.css';

interface LightboxProps {
  images: string[];
  /** Optional per-image caption shown under the enlarged photo. */
  descriptions?: string[];
  index: number;
  open: boolean;
  onClose: () => void;
}

/** Click-to-enlarge image viewer, the yet-another-react-lightbox replacement for the old static site's Magnific Popup. */
export default function Lightbox({ images, descriptions, index, open, onClose }: LightboxProps) {
  return (
    <YarlLightbox
      open={open}
      close={onClose}
      index={index}
      slides={images.map((src, i) => ({ src, description: descriptions?.[i] }))}
      plugins={[Captions]}
      captions={{ descriptionTextAlign: 'center' }}
    />
  );
}
