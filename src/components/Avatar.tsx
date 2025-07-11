import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface AvatarProps {
    image?: string;
    id: string;
    size: 'small' | 'medium' | 'large' | 'extra-large';
    loading?: boolean;
    level?: number;
    showLevel?: boolean;
}

const Avatar: React.FC<AvatarProps> = ({
    image,
    loading,
    id,
    size,
    level = 1,
    showLevel = false
}) => {
    const navigate = useNavigate();
    const [loaded, setLoaded] = useState<boolean>(false);

    useEffect(() => {
        console.log("Avatar props updated:", { image, loading, level });
    }, [image, loading, level]);

    let sizeClasses, skeletonSize;
    switch (size) {
        case 'small':
            sizeClasses = 'w-10 h-10';
            skeletonSize = 40;
            break;
        case 'medium':
            sizeClasses = 'w-12 h-12';
            skeletonSize = 48;
            break;
        case 'large':
            sizeClasses = 'w-24 h-24 p-1';
            skeletonSize = 96;
            break;
        case 'extra-large':
            sizeClasses = 'w-36 h-36 p-1';
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
            className={`${sizeClasses} rounded-full bg-gray-700 animate-pulse`}
            style={{ width: skeletonSize, height: skeletonSize }}
        />
    );

    return (
        <div className="min-w-[48px]">
            {loading ? (
                <LoadingSkeleton />
            ) : (
                <div onClick={() => navigate(`/profile/${id}`)} style={{ cursor: 'pointer' }}>
                    {!loaded && <LoadingSkeleton />}
                    <div className="relative">
                        <img
                            src={image || "https://i.imgur.com/uUfJSwW.png"}
                            alt="avatar"
                            className={`${sizeClasses} rounded-full object-cover border-2 aspect-square ${loaded ? '' : 'hidden'}`}
                            style={{ borderColor: getLevelColor() }}
                            onLoad={() => setLoaded(true)}
                        />
                        {showLevel && (
                            <div
                                className={`absolute rounded-full text-xs font-semibold min-w-[20px] h-5 flex justify-center items-center text-white ${LevelSize} ${DivPosition}`}
                                style={{ backgroundColor: getLevelColor() }}
                            >
                                {level}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Avatar;
