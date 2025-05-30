import "./ProgressIndicator.css";

const ProgressIndicator = ({
  size = 40,
  progress,
}: {
  size?: number;
  progress?: number;
}) => {
  return !progress ? (
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
  ) : (
    <div>
      <div style={{ width: size, height: size }}>
        <progress value={progress} max={1}>
          <span>{Math.round((progress / 100) * 100)}%</span>
        </progress>
      </div>
    </div>
  );
};

export default ProgressIndicator;
