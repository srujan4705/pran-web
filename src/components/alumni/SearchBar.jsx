import React from "react";
import { Search } from "lucide-react";

export default function SearchBar({ value, onChange, placeholder = "Search alumni by name, profession..." }) {
  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl opacity-0 group-focus-within:opacity-100 blur-xl transition-opacity duration-500" />
      <div className="relative bg-white rounded-2xl border border-slate-200 group-focus-within:border-indigo-300 group-focus-within:shadow-lg group-focus-within:shadow-indigo-100/50 transition-all duration-300 overflow-hidden">
        <div className="flex items-center px-5 py-4">
          <Search className="w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors mr-3 flex-shrink-0" />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full text-base bg-transparent outline-none placeholder:text-slate-400 text-slate-700"
          />
        </div>
      </div>
    </div>
  );
}