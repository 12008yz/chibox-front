import { useState, useEffect } from "react";

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

const Avatar: React.FC<AvatarProps> = ({
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

    // Генерируем fallback аватар на основе ID
    const generateFallbackAvatar = (userId: string) => {
        const colors = [
            '#6366f1', '#8b5cf6', '#a855f7', '#c084fc', '#ec4899',
            '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
            '#22c55e', '#10b981', '#06b6d4', '#0ea5e9', '#3b82f6'
        ];

        const colorIndex = userId.length % colors.length;
        const color = colors[colorIndex];
        const letter = userId.charAt(0).toUpperCase();

        return `https://ui-avatars.com/api/?name=${letter}&background=${color.replace('#', '')}&color=ffffff&size=128&font-size=0.6`;
    };

    useEffect(() => {
        setLoaded(false);
        setImageError(false);

        // Определяем источник изображения прямо здесь
        const getImageSource = () => {
            // Приоритет: пользовательское изображение > Steam аватар > fallback
            if (image) {
                return image;
            }
            if (steamAvatar) {
                return steamAvatar;
            }
            return generateFallbackAvatar(id);
        };

        // Принудительно проверяем загрузку изображения
        const imgSrc = getImageSource();
        if (imgSrc) {
            const img = new Image();
            img.onload = () => setLoaded(true);
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
        // Приоритет: загруженное изображение > Steam аватар > fallback
        if (image && !imageError) {
            return image;
        }
        if (steamAvatar && !imageError) {
            return steamAvatar;
        }
        return generateFallbackAvatar(id);
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
};

export default Avatar;
