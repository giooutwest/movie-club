import { LogMovieFlow } from "./log-movie-flow";

export default function LogMoviePage() {
  return (
    <div className="animate-fade-up">
      <h1 className="mb-2 text-xl font-[var(--font-display)] uppercase tracking-wide text-neutral-100">
        Log a movie
      </h1>
      <p className="mb-6 text-sm text-neutral-500">
        Already watched something with the club? Find it and log your score.
      </p>
      <LogMovieFlow />
    </div>
  );
}
