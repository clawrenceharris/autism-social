import type { CSSProperties } from "react";
import "./Skeleton.css";

interface SkeletonProps {
  variant?: "text" | "title" | "squircle-button" | "button" | "card";
  width?: string | number;
  height?: string | number;
  style?: CSSProperties;
  className?: string;
}

const Skeleton = ({
  variant = "text",
  width,
  height,
  style,
  className,
}: SkeletonProps) => {
  const classes = ["skeleton", `skeleton-${variant}`, className]
    .filter(Boolean)
    .join(" ");

  const combinedStyles: CSSProperties = {
    width: width,
    height: height,
    ...style,
  };

  return <div className={classes} style={combinedStyles} />;
};

export default Skeleton;
