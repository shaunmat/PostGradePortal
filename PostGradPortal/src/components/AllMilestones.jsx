export const AllMilestones = ({ milestones, moduleColors, onViewMilestone }) => {
    return (
        <section className="relative border-l ml-8 border-gray-200 dark:border-gray-700">
            {milestones.map((milestone, index) => (
                <div key={index} className="mb-10 pl-6 relative">
                    <span
                        className={`absolute flex items-center justify-center w-6 h-6 ${moduleColors[milestone.module] || 'bg-blue-100'} rounded-full -left-3 ring-8 ring-white dark:ring-gray-900`}
                    >
                        <svg className="w-2.5 h-2.5 text-white dark:text-blue-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z"/>
                        </svg>
                    </span>
                    <h3 className="flex items-center mb-1 text-lg font-semibold text-gray-900 dark:text-white">
                        {milestone.title}
                        {milestone.latest && (
                            <span className="bg-blue-100 text-blue-800 text-sm font-medium mx-3 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">Latest</span>
                        )}
                    </h3>
                    <time className="block mb-2 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
                        {milestone.date}
                    </time>
                    <p className="mb-2 text-base font-normal text-gray-500 dark:text-gray-400">
                        {milestone.description}
                    </p>
                    <p className="mb-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                        {milestone.module}
                    </p>
                    {milestone.linkText && (
                        <a href={milestone.linkHref} className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:outline-none focus:ring-gray-100 focus:text-blue-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-700">
                            <svg className="w-3.5 h-3.5 mr-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M14.707 7.793a1 1 0 0 0-1.414 0L11 10.086V1.5a1 1 0 0 0-2 0v8.586L6.707 7.793a1 1 0 1 0-1.414 1.414l4 4a1 1 0 0 0 1.416 0l4-4a1 1 0 0 0-.002-1.414Z"/>
                                <path d="M18 12h-2.55l-2.975 2.975a3.5 3.5 0 0 1-4.95 0L4.55 12H2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2Zm-3 5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"/>
                            </svg>
                            {milestone.linkText}
                        </a>
                    )}
                    <button
                        onClick={() => onViewMilestone(milestone)}
                        className="inline-flex items-center px-4 py-2 mt-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:outline-none focus:ring-gray-100 focus:text-blue-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-700"
                    >
                        View Details
                    </button>
                </div>
            ))}
        </section>
    );
};
