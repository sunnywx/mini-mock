import { ReactNode } from "react";

export const IconBtn = ({ children, onClick }: {children: ReactNode, onClick?: any}) => (
  <span
    className="inline-flex items-center w-auto hover:bg-slate-300 bg-slate-200 rounded-md p-1 text-sm cursor-pointer"
    onClick={onClick}
  >
    {children}
  </span>
);