import RandomCard from './RandomCard'
import QuoteCard from './QuoteCard'
import DateCard from './DateCard'
import TaskCard from './TaskCard'

const fallback = {
  task: {
    title: 'Task Name',
    course: 'Course Name',
  },
  quote: {
    text: "To fail is to learn—to stop learning is to lose.",
    author: "|_| |",
  },
}

export default function Grid({ task, quote }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
        <RandomCard/>
        <QuoteCard quote={quote ?? fallback.quote}/>

      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <DateCard />
        <TaskCard task={task ?? fallback.task}/>
      </div>
    </div>
  );
}