interface CourseHeaderProps {
  title: string;
  subtitle?: string;
  progress?: number;
  level?: number;
  xp?: number;
  onBack?: () => void;
}

export default function CourseHeader({
  title,
  subtitle,
  progress = 0,
  level = 1,
  xp = 0,
  onBack,
}: CourseHeaderProps) {
  return (
    <header className="flex flex-col sm:flex-row items-center justify-between w-full bg-white shadow-sm border-b border-gray-100 p-4 rounded-md">
      <div className="flex flex-col items-start space-y-1">
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        <p className="text-xs text-gray-400">
          Progress: {progress}% • Level {level} • {xp} XP
        </p>
      </div>
      {onBack && (
        <button
          onClick={onBack}
          className="mt-3 sm:mt-0 px-4 py-2 text-sm bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition"
        >
          Back
        </button>
      )}
    </header>
  );
}
