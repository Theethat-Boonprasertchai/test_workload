// Chart component: stacked bar / bar / heatmap of weekly workload
// Drag & drop tasks across days.

const { useState, useRef, useEffect } = React;

// Map proximity to today → background color
// distance 0 (today) → urgent red, fading to safe green by day 6+
function urgencyBg(distance) {
  if (distance < 0) return 'transparent'; // past
  const d = Math.min(distance, 7);
  // hue 25 (red) → 145 (green), lightness 0.92 (subtle), chroma 0.07
  const t = d / 7; // 0 = today (red), 1 = far (green)
  const hue = 25 + t * 120;
  const chroma = 0.08 - t * 0.04;
  const light = 0.93 + t * 0.03;
  return `oklch(${light} ${chroma} ${hue})`;
}
function urgencyText(distance) {
  if (distance < 0) return 'var(--ink-3)';
  const d = Math.min(distance, 7);
  const tt = d / 7;
  const hue = 25 + tt * 120;
  const chroma = 0.13 - tt * 0.06;
  const light = 0.45 + tt * 0.10;
  return `oklch(${light} ${chroma} ${hue})`;
}

function WorkloadChart({
  tasks, subjects, capacity, dayLabels, dates,
  chartType, t, density, todayDate,
  onMoveSlot, onSelectTask, selectedTaskId,
}) {
  const [drag, setDrag] = useState(null); // {taskId, slotIdx, fromDay, x, y, w}
  const [hoverDay, setHoverDay] = useState(null);
  const chartRef = useRef(null);

  // Aggregate per-day stacks
  const daySlots = Array.from({ length: 7 }, () => []); // each day: [{taskId, hours}]
  tasks.forEach((task) => {
    task.slots.forEach((slot, idx) => {
      daySlots[slot.day].push({ taskId: task.id, slotIdx: idx, hours: slot.hours, task });
    });
  });

  const dayTotals = daySlots.map((s) => s.reduce((a, b) => a + b.hours, 0));
  const maxHours = Math.max(capacity * 1.4, ...dayTotals, 8);
  const heaviestDay = dayTotals.indexOf(Math.max(...dayTotals));

  // Heights — larger for better visibility
  const chartH = density === 'compact' ? 400 : 500;
  const barW = density === 'compact' ? 72 : 96;
  const gap = density === 'compact' ? 24 : 32;

  const hToY = (h) => (h / maxHours) * chartH;

  const onSlotMouseDown = (e, taskId, slotIdx, fromDay) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setDrag({
      taskId, slotIdx, fromDay,
      x: e.clientX, y: e.clientY,
      ox: e.clientX - rect.left,
      oy: e.clientY - rect.top,
      w: rect.width, h: rect.height,
    });
  };

  useEffect(() => {
    if (!drag) return;
    const move = (ev) => {
      setDrag((d) => d && { ...d, x: ev.clientX, y: ev.clientY });
      // detect day under cursor
      if (chartRef.current) {
        const cols = chartRef.current.querySelectorAll('[data-day]');
        let found = null;
        cols.forEach((c) => {
          const r = c.getBoundingClientRect();
          if (ev.clientX >= r.left && ev.clientX <= r.right) {
            found = parseInt(c.dataset.day, 10);
          }
        });
        setHoverDay(found);
      }
    };
    const up = () => {
      setDrag((d) => {
        if (d && hoverDay != null && hoverDay !== d.fromDay) {
          onMoveSlot(d.taskId, d.slotIdx, hoverDay);
        }
        return null;
      });
      setHoverDay(null);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
  }, [drag, hoverDay, onMoveSlot]);

  // distance in days from today for each column
  const dayDistance = (idx) => {
    if (!todayDate) return -1;
    const ms = dates[idx].setHours(0,0,0,0) - new Date(todayDate).setHours(0,0,0,0);
    return Math.round(ms / 86400000);
  };

  if (chartType === 'heatmap') {
    // Heatmap removed
    return null;
  }

  return (
    <div className="chart-wrap" ref={chartRef}>
      {/* Y-axis grid lines */}
      <div className="chart-grid" style={{ height: chartH }}>
        {[0, 0.25, 0.5, 0.75, 1].map((p) => {
          const h = p * maxHours;
          return (
            <div key={p} className="grid-line" style={{ bottom: hToY(h) }}>
              <span className="grid-label">{h.toFixed(0)}h</span>
            </div>
          );
        })}
        {/* Capacity limit line */}
        <div className="capacity-line" style={{ bottom: hToY(capacity) }}>
          <span className="capacity-label">
            {t.capacity} · <span className="mono">{capacity}{t.hours}</span>{t.perDay}
          </span>
        </div>
      </div>

      {/* Day columns */}
      <div className="chart-cols" style={{ height: chartH, gap }}>
        {Array.from({ length: 7 }).map((_, dayIdx) => {
          const slots = daySlots[dayIdx];
          const total = dayTotals[dayIdx];
          const over = total > capacity;
          const isHover = hoverDay === dayIdx && drag;
          const isHeaviest = dayIdx === heaviestDay && total > 0;

          return (
            <div key={dayIdx} className={`chart-col ${isHover ? 'drop-target' : ''}`}
                 data-day={dayIdx} style={{ width: barW }}>
              {/* Overload warning badge */}
              {over && (
                <div className="overload-badge" style={{ bottom: hToY(total) + 6 }}>
                  <span className="overload-icon">⚠</span>
                  <span className="overload-label">Workload NotBalance!</span>
                </div>
              )}
              {/* Day total label above bar */}
              {total > 0 && !over && (
                <div className="day-total mono" style={{ bottom: hToY(total) + 6 }}>
                  {total}{t.hours}
                </div>
              )}
              {/* Stack */}
              <div className="stack" style={{ height: chartH }}>
                {chartType === 'stacked' ? (
                  slots.map((s, i) => {
                    const subj = subjects.find((x) => x.id === s.task.subjectId);
                    const isDragging = drag && drag.taskId === s.taskId && drag.slotIdx === s.slotIdx && drag.fromDay === dayIdx;
                    const isSelected = selectedTaskId === s.taskId;
                    return (
                      <div
                        key={i}
                        className={`slot ${isDragging ? 'dragging' : ''} ${isSelected ? 'selected' : ''}`}
                        style={{
                          height: hToY(s.hours),
                          background: subj?.color,
                          opacity: isDragging ? 0.25 : (selectedTaskId && !isSelected ? 0.4 : 1),
                        }}
                        onMouseDown={(e) => onSlotMouseDown(e, s.taskId, s.slotIdx, dayIdx)}
                        onClick={() => onSelectTask(s.taskId)}
                        title={`${s.task.title} · ${s.hours}${t.hours}`}
                      >
                        {s.hours >= 1.5 && (
                          <span className="slot-label">
                            {subj?.short}<span className="mono"> · {s.hours}h</span>
                          </span>
                        )}
                      </div>
                    );
                  })
                ) : (
                  // bar (single block with solid color)
                  total > 0 && (
                    <div className="slot bar-mode" style={{
                      height: hToY(total),
                      background: over ? '#fb7185' : '#a78bfa',
                      boxShadow: '0 2px 8px rgba(167, 139, 250, 0.3)',
                    }} />
                  )
                )}
              </div>
              {/* Day axis label — colored by proximity to today */}
              {(() => {
                const dist = dayDistance(dayIdx);
                const bg = urgencyBg(dist);
                const fg = urgencyText(dist);
                const isToday = dist === 0;
                return (
                  <div className={`day-label ${isHeaviest ? 'heaviest' : ''} ${over ? 'over' : ''} ${isToday ? 'is-today' : ''}`}
                       style={{ background: bg, color: fg }}>
                    <div className="dlabel" style={{ color: fg }}>{dayLabels[dayIdx]}</div>
                    <div className="ddate mono" style={{ color: fg, opacity: 0.78 }}>{dates[dayIdx].getDate()}</div>
                    {isToday && <div className="today-pip" />}
                  </div>
                );
              })()}
            </div>
          );
        })}
      </div>

      {/* Drag ghost */}
      {drag && (() => {
        const task = tasks.find((x) => x.id === drag.taskId);
        const slot = task?.slots[drag.slotIdx];
        const subj = subjects.find((s) => s.id === task?.subjectId);
        if (!slot) return null;
        return (
          <div className="drag-ghost" style={{
            left: drag.x - drag.ox, top: drag.y - drag.oy,
            width: drag.w, height: drag.h,
            background: subj?.color,
          }}>
            <span className="slot-label">{subj?.short}<span className="mono"> · {slot.hours}h</span></span>
          </div>
        );
      })()}
    </div>
  );
}

// HeatmapView removed

window.WorkloadChart = WorkloadChart;
