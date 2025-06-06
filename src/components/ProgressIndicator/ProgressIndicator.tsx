import "./ProgressIndicator.scss";

const ProgressIndicator = ({ size = 40 }: { size?: number }) => {
  return (
    <div
      style={{
        padding: 3,
        width: size,
        height: size,
        minHeight: size,
        minWidth: size,
      }}
      className="loader"
    >
      <div style={{ width: size / 2, height: size / 2 }} />
    </div>
  );
};

export default ProgressIndicator;
