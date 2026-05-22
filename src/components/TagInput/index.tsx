import { Tag } from "antd";
import styles from "./index.less";
import { useCallback, useEffect, useState } from "react";

interface TagInputProps {
  values: string[];
  onChange: (value: string[]) => void;
}
const TagInputPage: React.FC<TagInputProps> = ({ values, onChange }) => {
  const removeTag = useCallback(
    (index: number) => {
      const newItems = values.filter((_, i) => i !== index);
      onChange?.(newItems);
    },
    [values, onChange]
  );
  return (
    <div className={styles["tag-input"]}>
      {values.map((tag, index) => (
        <Tag
          key={index}
          closable
          onClose={(e) => {
            e.preventDefault();
            removeTag(index);
          }}
          className={styles["tag"]}
        >
          {tag}
        </Tag>
      ))}
    </div>
  );
};

export default TagInputPage;
