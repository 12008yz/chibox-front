import { useState, useEffect, memo } from "react";
import { getPreferredAvatar } from "../utils/avatarUtils";

interface AvatarProps {
    image?: string;
    steamAvatar?: string;
    id: string;
    size: 'small' | 'medium' | 'large' | 'extra-large';
    loading?: boolean;
    level?: number;
    showLevel?: boolean;
    onClick?: () => void;
    forceShowBorder?: boolean;
}

const Avatar: React.FC<AvatarProps> = memo(({
    image,
    steamAvatar,
    loading,
    id,
    size,
    level = 1,
    showLevel = false,
    onClick,
    forceShowBorder = false
}) => {
    const [loaded, setLoaded] = useState<boolean>(false);
    const [imageError, setImageError] = useState<boolean>(false);

    useEffect(() => {
        setLoaded(false);
        setImageError(false);

        // Получаем приоритетный источник аватара
        const imgSrc = getPreferredAvatar(image, steamAvatar, id);

        if (imgSrc) {
            const img = new Image();
            img.onload = () => {
                setLoaded(true);
            };
            img.onerror = () => {
                setImageError(true);
                setLoaded(true);
            };
            img.src = imgSrc;
        }
    }, [image, steamAvatar, id]);

    let sizeClasses, skeletonSize;
    switch (size) {
        case 'small':
            sizeClasses = 'w-10 h-10 aspect-square';
            skeletonSize = 40;
            break;
        case 'medium':
            sizeClasses = 'w-12 h-12 aspect-square';
            skeletonSize = 48;
            break;
        case 'large':
            sizeClasses = 'w-24 h-24 aspect-square';
            skeletonSize = 96;
            break;
        case 'extra-large':
            sizeClasses = 'w-36 h-36 aspect-square';
            skeletonSize = 144;
            break;
    }

    const getLevelColor = () => {
        if (level >= 0 && level <= 10) return '#3b82f6';
        if (level >= 11 && level <= 20) return '#0066FF';
        if (level >= 21 && level <= 35) return '#A100FF';
        if (level >= 36 && level <= 50) return '#FF00FF';
        if (level >= 51 && level <= 75) return '#FF0066';
        if (level >= 76 && level <= 99) return '#FF0000';
        return '#FFCC00'; // level >= 100
    }

    let LevelSize, DivPosition;
    switch (size) {
        case 'small':
            LevelSize = 'w-5 h-5';
            DivPosition = '-bottom-1 right-1';
            break;
        case 'medium':
            LevelSize = 'min-w-[20px] h-5';
            DivPosition = 'bottom-0 -right-2';
            break;
        case 'large':
            LevelSize = 'w-8 h-8';
            DivPosition = 'bottom-3 right-3';
            break;
        case 'extra-large':
            LevelSize = 'min-w-[24px] h-6';
            DivPosition = 'bottom-3 right-3';
            break;
    }

    const LoadingSkeleton = () => (
        <div
            className={`${sizeClasses} rounded-full bg-gray-700 animate-pulse aspect-square`}
            style={{ width: skeletonSize, height: skeletonSize }}
        />
    );

    const getImageSrc = () => {
        // Используем утилиту для получения приоритетного аватара
        return getPreferredAvatar(
            imageError ? null : image,
            imageError ? null : steamAvatar,
            id
        );
    };

    const handleImageError = () => {
        setImageError(true);
        setLoaded(true); // Показываем fallback как загруженное
    };

    const handleImageLoad = () => {
        setLoaded(true);
    };

    return (
        <div className="flex items-center justify-center">
            {loading ? (
                <LoadingSkeleton />
            ) : (
                <div
                    onClick={onClick}
                    style={{ cursor: onClick ? 'pointer' : 'default' }}
                    className={`${onClick ? 'hover:opacity-80 transition-opacity' : ''} relative`}
                >
                    {!loaded && <LoadingSkeleton />}
                    {loaded && (
                        <>
                            <div
                                className={`${sizeClasses} rounded-full overflow-hidden border-2 ${forceShowBorder ? '' : 'max-lg:border-0'} flex items-center justify-center`}
                                style={{ borderColor: getLevelColor() }}
                            >
                                <img
                                    src={getImageSrc()}
                                    alt="avatar"
                                    className="w-full h-full object-cover"
                                    onLoad={handleImageLoad}
                                    onError={handleImageError}
                                />
                            </div>
                            {showLevel && (
                                <div
                                    className={`absolute rounded-full text-xs font-semibold min-w-[20px] h-5 flex justify-center items-center text-white ${LevelSize} ${DivPosition}`}
                                    style={{ backgroundColor: getLevelColor() }}
                                >
                                    {level}
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
});

Avatar.displayName = 'Avatar';

export default Avatar;
