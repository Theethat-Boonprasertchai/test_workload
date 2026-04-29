// Task list + summary stats + overload warnings

const { useState: useStateTL } = React;

function TaskList({ tasks, subjects, dayLabels, dates, capacity, t,
                    onDeleteTask, onSelectTask, selectedTaskId }) {
  if (tasks.length === 0) {
    return <div className="task-empty">{t.empty}</div>;
  }
  return (
    <div className="task-list">
      {tasks.map((task) => {
        const subj = subjects.find((s) => s.id === task.subjectId);
        const isSelected = selectedTaskId === task.id;
        return (
          <div
            key={task.id}
            className={`task-card ${isSelected ? 'selected' : ''}`}
            onClick={() => onSelectTask(task.id)}
          >
            <div className="task-bar" style={{ background: subj?.color }} />
            <div className="task-body">
              <div className="task-row1">
                <span className="task-subj mono">{subj?.short}</span>
                <span className="task-title">{task.title}</span>
              </div>
              <div className="task-row2">
                <span className="task-meta">
                  <span className="mono">{task.hours}{t.hours}</span> · {t.splitAcross} <span className="mono">{task.slots.length}</span> {t.days}
                </span>
                <span className="task-due">
                  {t.dueIn} <span className="mono">{dayLabels[task.deadline]} {dates[task.deadline].getDate()}</span>
                </span>
              </div>
              <div className="task-slots">
                {task.slots.map((slot, i) => (
                  <span key={i} className="task-slot mono">
                    {dayLabels[slot.day]}<span className="task-slot-h"> {slot.hours}h</span>
                  </span>
                ))}
              </div>
            </div>
            <button
              className="task-del"
              onClick={(e) => { e.stopPropagation(); onDeleteTask(task.id); }}
              aria-label={t.deleteTask}
            >✕</button>
          </div>
        );
      })}
    </div>
  );
}

function StatTile({ label, value, unit, tone }) {
  return (
    <div className={`stat ${tone || ''}`}>
      <div className="stat-label">{label}</div>
      <div className="stat-value mono">
        {value}
        {unit && <span className="stat-unit"> {unit}</span>}
      </div>
    </div>
  );
}

function OverloadBanner({ overDays, dayLabels, dates, t }) {
  if (overDays.length === 0) return null;
  return (
    <div className="overload-banner" role="alert">
      <span className="overload-dot" />
      <div className="overload-text">
        <strong>{t.overload}</strong> · <span className="overload-days">
          {overDays.map((d, i) => (
            <span key={d}>
              {dayLabels[d]} {dates[d].getDate()}{i < overDays.length - 1 ? ', ' : ''}
            </span>
          ))}
        </span>
        <div className="overload-hint">{t.overloadHint}</div>
      </div>
    </div>
  );
}

window.TaskList = TaskList;
window.StatTile = StatTile;
window.OverloadBanner = OverloadBanner;
