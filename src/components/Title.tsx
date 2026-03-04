interface TitleProps {
  title: string;
}

const Title: React.FC<TitleProps> = ({ title }) => {
  return (
    <div className="w-fit py-5 sm:py-6 md:py-8">
      <h2 className="section-title text-white w-auto text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
        {title.toUpperCase()}
      </h2>
      <div
        className="section-title-line w-full max-w-[140px] mt-3 h-0.5 rounded-full bg-gradient-to-r from-indigo-500 via-orange-400 to-amber-500"
        style={{ boxShadow: '0 0 16px rgba(99, 102, 241, 0.35), 0 0 24px rgba(251, 146, 60, 0.25)' }}
      />
    </div>
  );
};

export default Title;
