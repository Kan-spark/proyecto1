import React from "react";

export default function MainLayout({
  sidebar,
  content,
}: {
  sidebar: React.ReactNode;
  content: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-emerald-50/40">

      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-emerald-100 p-4 shadow-sm">
        {sidebar}
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {content}
      </main>

    </div>
  );
}