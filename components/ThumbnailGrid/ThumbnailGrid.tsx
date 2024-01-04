type ThumbnailGridProps = {
  children: React.ReactNode[];
};

const ThumbnailGrid = ({ children }: ThumbnailGridProps) => {
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 list-none p-0">
      {children.map((el, idx) => (
        <li key={idx}>
          {el}
        </li>
      ))}
    </ul>
  );
};

export default ThumbnailGrid;
