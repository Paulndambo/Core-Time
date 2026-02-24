import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Beaker, Lock } from 'lucide-react';

/**
 * Generic "Coming Soon" page for gated modules during MVP launch.
 * If the user wants to preview anyway, they can use Labs mode via `?labs=1`.
 */
const ComingSoon = ({
  title = 'Coming soon',
  description = 'This module is still in development. You can preview it in Labs, or head back to the Dashboard.',
}) => {
  const location = useLocation();
  const previewUrl = `${location.pathname}?labs=1`;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
          <Lock size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          <p className="text-slate-500 text-sm mt-0.5">{description}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/60 p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-2 text-slate-600 text-sm">
          <Beaker size={16} />
          <span>
            Want to peek early? Open this page in <span className="font-semibold">Labs preview</span>.
          </span>
        </div>
        <div className="flex gap-2">
          <Link to="/dashboard" className="btn btn-secondary gap-2">
            <ArrowLeft size={16} />
            Dashboard
          </Link>
          <Link to="/labs" className="btn btn-primary">
            Go to Labs
          </Link>
          <a href={previewUrl} className="btn btn-ghost border border-slate-200">
            Preview anyway
          </a>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;

