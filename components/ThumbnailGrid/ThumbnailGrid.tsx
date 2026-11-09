type ThumbnailGridProps = {
  children: React.ReactNode[];
};

const ThumbnailGrid = ({ children }: ThumbnailGridProps) => {
  return (
    // data-keynav-list: moving into the grid with h/j/k/l lands on its
    // first cat in the row (specs/0006)
    <ul data-keynav-list className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 list-none p-0">
      {children.map((el, idx) => (
        <li key={idx}>
          {el}
        </li>
      ))}
    </ul>
  );
};

export default ThumbnailGrid;
