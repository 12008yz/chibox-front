interface TitleProps {
  title: string;
}

const Title: React.FC<TitleProps> = ({ title }) => {
  return (
    <div className="w-fit py-6 sm:py-8 md:py-10">
      <div className="text-white w-auto text-xl sm:text-2xl md:text-3xl font-semibold">
        {title.toUpperCase()}
      </div>

      <div
        className="w-auto mt-1 h-0.5 sm:h-1 bg-[#505BC7] rounded-full shadow-lg transition-all"
        style={{
          boxShadow: '0px 0px 50px 10px #1d20b4'
        }}
      />
    </div>
  );
};

export default Title;
