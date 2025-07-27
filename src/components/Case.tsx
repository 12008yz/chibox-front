import { useState } from 'react';
import Monetary from './Monetary';

interface CaseProps {
  title: string;
  image: string | null;
  price: number;
}

const Case: React.FC<CaseProps> = ({ title, image, price }) => {
  const [loaded, setLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <div className="flex flex-col w-64 items-center rounded transition-all hover:scale-105 cursor-pointer">
      {!loaded && !imageError && (
        <div className="flex w-full h-64 items-center justify-center">
          <div className="spinner" />
        </div>
      )}

      {image && !imageError ? (
        <img
          src={image}
          alt={title}
          className={`w-1/2 md:w-full h-32 md:h-64 object-cover -ml-4 ${loaded ? '' : 'hidden'}`}
          onLoad={() => setLoaded(true)}
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="w-full h-64 bg-gray-700 flex items-center justify-center rounded">
          <span className="text-gray-400">Нет изображения</span>
        </div>
      )}

      <div className="flex flex-col gap-2 p-4 items-center">
        <div className="font-bold text-lg text-white text-center">{title}</div>
        <div className="font-medium text-md text-green-400">
          <Monetary value={price} />
        </div>
      </div>
    </div>
  );
};

export default Case;
