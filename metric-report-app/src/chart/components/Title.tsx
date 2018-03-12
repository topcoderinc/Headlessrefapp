import * as React from 'react';

export interface TitleProps {
  children: React.ReactNode;
}

/**
 * Displays a center title in each section.
 */
export const Title: React.SFC<TitleProps> = ({ children }) => {
  return (
    <p className="text-center">
      <strong>{children}</strong>
    </p>
  );
};
