import {
  ActionIcon,
  Badge,
  Box,
  Group,
  Paper,
  Text,
  Tooltip,
} from "@mantine/core";
import { IconZoomIn, IconZoomOut } from "@tabler/icons-react";
import { SECTION_CONFIG, SECTION_ORDER } from "../types";
import type { SectionType, TimelineEntry } from "../types";
import { memo, useCallback, useMemo, useRef, useState } from "react";
import dayjs from "dayjs";

interface TimelineProps {
  entries: TimelineEntry[];
  onEntryClick: (entry: TimelineEntry) => void;
  onEntryUpdate: (entry: TimelineEntry) => void;
  onDateClick: (date: string, sectionType: SectionType) => void;
}

const MONTH_WIDTH_OPTIONS = [8, 12, 18, 28, 45];

interface DragState {
  entryId: string;
  type: "move" | "resize-start" | "resize-end";
  startX: number;
  originalStartDate: string;
  originalEndDate?: string;
}

interface ScrollDragState {
  startX: number;
  startScrollLeft: number;
}

// Memoized month cell component
const MonthCell = memo(function MonthCell({
  month,
  monthWidth,
  isCurrentMonth,
  isYearEnd,
}: {
  month: dayjs.Dayjs;
  monthWidth: number;
  isCurrentMonth: boolean;
  isYearEnd: boolean;
}) {
  return (
    <Box
      style={{
        width: monthWidth,
        flexShrink: 0,
        borderRight: isYearEnd
          ? "2px solid var(--mantine-color-gray-4)"
          : "1px solid var(--mantine-color-gray-2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: isCurrentMonth
          ? "var(--mantine-color-blue-0)"
          : undefined,
      }}
    >
      <Text size="xs" c={isCurrentMonth ? "blue" : "dimmed"}>
        {monthWidth >= 80 ? month.format("MMM") : month.format("M")}
      </Text>
    </Box>
  );
});

// Memoized grid cell component
const GridCell = memo(function GridCell({
  monthKey,
  monthWidth,
  isCurrentMonth,
  isYearEnd,
}: {
  monthKey: string;
  monthWidth: number;
  isCurrentMonth: boolean;
  isYearEnd: boolean;
}) {
  return (
    <Box
      data-month={monthKey}
      style={{
        width: monthWidth,
        flexShrink: 0,
        borderRight: isYearEnd
          ? "2px solid var(--mantine-color-gray-3)"
          : "1px solid var(--mantine-color-gray-1)",
        backgroundColor: isCurrentMonth
          ? "var(--mantine-color-blue-0)"
          : undefined,
      }}
    />
  );
});

// Memoized entry component
const TimelineEntryItem = memo(function TimelineEntryItem({
  entry,
  left,
  width,
  rowIndex,
  isDragging,
  maxWidth,
  onMouseDown,
  onClick,
}: {
  entry: TimelineEntry;
  left: number;
  width: number;
  rowIndex: number;
  isDragging: boolean;
  maxWidth: number;
  onMouseDown: (e: React.MouseEvent, type: "move" | "resize-start" | "resize-end") => void;
  onClick: (e: React.MouseEvent) => void;
}) {
  const config = SECTION_CONFIG[entry.sectionType];
  const clampedLeft = Math.max(left, 0) + 2;
  const clampedWidth = Math.min(width, maxWidth - left);

  return (
    <Tooltip
      label={`${entry.title} (${dayjs(entry.startDate).format("MMM D, YYYY")}${entry.endDate ? ` - ${dayjs(entry.endDate).format("MMM D, YYYY")}` : ""})`}
      position="top"
      disabled={isDragging}
    >
      <Paper
        shadow="xs"
        style={{
          position: "absolute",
          left: clampedLeft,
          top: rowIndex * 36 + 6,
          width: clampedWidth,
          height: 30,
          backgroundColor: `var(--mantine-color-${config.color}-${isDragging ? "2" : "1"})`,
          border: `1px solid var(--mantine-color-${config.color}-${isDragging ? "6" : "4"})`,
          cursor: isDragging ? "grabbing" : "grab",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          userSelect: "none",
          opacity: isDragging ? 0.9 : 1,
          zIndex: isDragging ? 100 : 1,
        }}
        onMouseDown={(e) => onMouseDown(e, "move")}
        onClick={onClick}
      >
        {/* Left resize handle */}
        <Box
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 8,
            height: "100%",
            cursor: "ew-resize",
            backgroundColor: "transparent",
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
            onMouseDown(e, "resize-start");
          }}
        >
          <Box
            style={{
              position: "absolute",
              left: 2,
              top: "50%",
              transform: "translateY(-50%)",
              width: 3,
              height: 14,
              backgroundColor: `var(--mantine-color-${config.color}-4)`,
              borderRadius: 2,
              opacity: 0.6,
            }}
          />
        </Box>

        {/* Entry label */}
        <Text
          size="xs"
          truncate
          style={{
            color: `var(--mantine-color-${config.color}-9)`,
            flex: 1,
            padding: "0 12px",
          }}
        >
          {entry.title}
        </Text>

        {/* Right resize handle */}
        <Box
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            width: 8,
            height: "100%",
            cursor: "ew-resize",
            backgroundColor: "transparent",
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
            onMouseDown(e, "resize-end");
          }}
        >
          <Box
            style={{
              position: "absolute",
              right: 2,
              top: "50%",
              transform: "translateY(-50%)",
              width: 3,
              height: 14,
              backgroundColor: `var(--mantine-color-${config.color}-4)`,
              borderRadius: 2,
              opacity: 0.6,
            }}
          />
        </Box>
      </Paper>
    </Tooltip>
  );
});

export function Timeline({
  entries,
  onEntryClick,
  onEntryUpdate,
  onDateClick,
}: TimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoomLevel, setZoomLevel] = useState(3);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [dragPreview, setDragPreview] = useState<{
    startDate: string;
    endDate?: string;
  } | null>(null);
  const [scrollDrag, setScrollDrag] = useState<ScrollDragState | null>(null);

  const monthWidth = MONTH_WIDTH_OPTIONS[zoomLevel];

  // Calculate year range
  const { startYear, endYear } = useMemo(() => {
    const currentYear = dayjs().year();
    let minYear = currentYear - 2;
    let maxYear = currentYear;

    for (const entry of entries) {
      const entryStartYear = dayjs(entry.startDate).year();
      const entryEndYear = entry.endDate
        ? dayjs(entry.endDate).year()
        : entryStartYear;
      if (entryStartYear < minYear) minYear = entryStartYear;
      if (entryEndYear > maxYear) maxYear = entryEndYear;
    }

    return { startYear: minYear, endYear: maxYear };
  }, [entries]);

  const visibleYears = endYear - startYear + 1;
  const totalMonths = visibleYears * 12;
  const viewStart = useMemo(
    () => dayjs().year(startYear).month(0).date(1),
    [startYear]
  );

  // Pre-compute month data
  const monthsData = useMemo(() => {
    const result: Array<{
      date: dayjs.Dayjs;
      key: string;
      isCurrentMonth: boolean;
      isYearEnd: boolean;
    }> = [];
    const now = dayjs();
    for (let i = 0; i < totalMonths; i++) {
      const date = viewStart.add(i, "month");
      result.push({
        date,
        key: date.format("YYYY-MM"),
        isCurrentMonth: date.isSame(now, "month"),
        isYearEnd: date.month() === 11,
      });
    }
    return result;
  }, [viewStart, totalMonths]);

  // Group entries by section
  const entriesBySection = useMemo(() => {
    const grouped: Record<SectionType, TimelineEntry[]> = {
      symptom: [],
      medication: [],
      supplement: [],
      diet: [],
      bodyComposition: [],
      fitness: [],
      misc: [],
    };
    for (const entry of entries) {
      grouped[entry.sectionType].push(entry);
    }
    return grouped;
  }, [entries]);

  // Calculate rows for a section
  const calculateRows = useCallback((sectionEntries: TimelineEntry[]) => {
    const rows: TimelineEntry[][] = [];
    const sorted = [...sectionEntries].sort((a, b) =>
      a.startDate.localeCompare(b.startDate)
    );

    for (const entry of sorted) {
      const entryStart = dayjs(entry.startDate);
      const entryEnd = entry.endDate ? dayjs(entry.endDate) : entryStart;

      let placed = false;
      for (const row of rows) {
        let canFit = true;
        for (const existing of row) {
          const existingStart = dayjs(existing.startDate);
          const existingEnd = existing.endDate
            ? dayjs(existing.endDate)
            : existingStart;
          if (
            !(
              entryEnd.isBefore(existingStart, "day") ||
              entryStart.isAfter(existingEnd, "day")
            )
          ) {
            canFit = false;
            break;
          }
        }
        if (canFit) {
          row.push(entry);
          placed = true;
          break;
        }
      }
      if (!placed) {
        rows.push([entry]);
      }
    }

    return rows;
  }, []);

  // Pre-compute section rows
  const sectionRows = useMemo(() => {
    const result: Record<SectionType, TimelineEntry[][]> = {} as Record<SectionType, TimelineEntry[][]>;
    for (const sectionType of SECTION_ORDER) {
      result[sectionType] = calculateRows(entriesBySection[sectionType]);
    }
    return result;
  }, [entriesBySection, calculateRows]);

  const getEntryPosition = useCallback(
    (entry: TimelineEntry, previewDates?: { startDate: string; endDate?: string }) => {
      const startDate = previewDates?.startDate || entry.startDate;
      const endDate =
        previewDates?.endDate !== undefined ? previewDates.endDate : entry.endDate;

      const start = dayjs(startDate);
      const end = endDate ? dayjs(endDate) : start;

      const startMonthOffset = start.diff(viewStart, "month", true);
      const endMonthOffset = end.diff(viewStart, "month", true);

      const left = startMonthOffset * monthWidth;
      const width = Math.max(
        (endMonthOffset - startMonthOffset + 1) * monthWidth - 4,
        monthWidth * 0.5
      );

      return { left, width };
    },
    [viewStart, monthWidth]
  );

  const handleMouseDown = useCallback(
    (
      e: React.MouseEvent,
      entry: TimelineEntry,
      type: "move" | "resize-start" | "resize-end"
    ) => {
      e.stopPropagation();
      e.preventDefault();

      setDragState({
        entryId: entry.id,
        type,
        startX: e.clientX,
        originalStartDate: entry.startDate,
        originalEndDate: entry.endDate,
      });
      setDragPreview({
        startDate: entry.startDate,
        endDate: entry.endDate,
      });
    },
    []
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (scrollDrag && containerRef.current) {
        const deltaX = e.clientX - scrollDrag.startX;
        containerRef.current.scrollLeft = scrollDrag.startScrollLeft - deltaX;
        return;
      }

      if (!dragState) return;

      const deltaX = e.clientX - dragState.startX;
      const deltaMonths = deltaX / monthWidth;

      const entry = entries.find((en) => en.id === dragState.entryId);
      if (!entry) return;

      const originalStart = dayjs(dragState.originalStartDate);
      const originalEnd = dragState.originalEndDate
        ? dayjs(dragState.originalEndDate)
        : originalStart;

      let newStartDate: dayjs.Dayjs;
      let newEndDate: dayjs.Dayjs | undefined;

      if (dragState.type === "move") {
        newStartDate = originalStart.add(Math.round(deltaMonths * 30), "day");
        newEndDate = dragState.originalEndDate
          ? originalEnd.add(Math.round(deltaMonths * 30), "day")
          : undefined;
      } else if (dragState.type === "resize-start") {
        newStartDate = originalStart.add(Math.round(deltaMonths * 30), "day");
        newEndDate = dragState.originalEndDate ? originalEnd : undefined;

        if (newEndDate && newStartDate.isAfter(newEndDate)) {
          newStartDate = newEndDate;
        }
      } else {
        newStartDate = originalStart;
        const calculatedEnd = originalEnd.add(
          Math.round(deltaMonths * 30),
          "day"
        );

        if (calculatedEnd.isBefore(newStartDate)) {
          newEndDate = newStartDate;
        } else {
          newEndDate = calculatedEnd;
        }
      }

      setDragPreview({
        startDate: newStartDate.format("YYYY-MM-DD"),
        endDate: newEndDate?.format("YYYY-MM-DD"),
      });
    },
    [dragState, scrollDrag, entries, monthWidth]
  );

  const handleMouseUp = useCallback(() => {
    if (scrollDrag) {
      setScrollDrag(null);
      return;
    }

    if (!dragState || !dragPreview) {
      setDragState(null);
      setDragPreview(null);
      return;
    }

    const entry = entries.find((en) => en.id === dragState.entryId);
    if (entry) {
      onEntryUpdate({
        ...entry,
        startDate: dragPreview.startDate,
        endDate: dragPreview.endDate,
      });
    }

    setDragState(null);
    setDragPreview(null);
  }, [dragState, dragPreview, scrollDrag, entries, onEntryUpdate]);

  const handleMouseLeave = useCallback(() => {
    if (scrollDrag) {
      setScrollDrag(null);
    }
    if (dragState) {
      handleMouseUp();
    }
  }, [dragState, scrollDrag, handleMouseUp]);

  const handleScrollDragStart = useCallback(
    (e: React.MouseEvent) => {
      if (containerRef.current && !dragState) {
        setScrollDrag({
          startX: e.clientX,
          startScrollLeft: containerRef.current.scrollLeft,
        });
      }
    },
    [dragState]
  );

  const handleGridDoubleClick = useCallback(
    (e: React.MouseEvent, sectionType: SectionType) => {
      if (dragState || scrollDrag) return;
      const target = e.target as HTMLElement;
      const monthKey = target.dataset.month;
      if (monthKey) {
        onDateClick(`${monthKey}-01`, sectionType);
      }
    },
    [dragState, scrollDrag, onDateClick]
  );

  const zoomOut = useCallback(() => setZoomLevel((z) => Math.max(0, z - 1)), []);
  const zoomIn = useCallback(
    () => setZoomLevel((z) => Math.min(MONTH_WIDTH_OPTIONS.length - 1, z + 1)),
    []
  );

  const totalWidth = monthWidth * totalMonths;

  return (
    <Box
      style={{ height: "100%", display: "flex", flexDirection: "column" }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      <Group
        p="xs"
        gap="xs"
        style={{ borderBottom: "1px solid var(--mantine-color-gray-3)" }}
      >
        <ActionIcon variant="light" onClick={zoomOut} disabled={zoomLevel === 0}>
          <IconZoomOut size={16} />
        </ActionIcon>
        <ActionIcon
          variant="light"
          onClick={zoomIn}
          disabled={zoomLevel === MONTH_WIDTH_OPTIONS.length - 1}
        >
          <IconZoomIn size={16} />
        </ActionIcon>
        <Text size="sm" c="dimmed">
          {startYear} - {endYear}
        </Text>
        {dragPreview && (
          <Text size="xs" c="blue">
            {dayjs(dragPreview.startDate).format("MMM D, YYYY")}
            {dragPreview.endDate &&
              ` - ${dayjs(dragPreview.endDate).format("MMM D, YYYY")}`}
          </Text>
        )}
      </Group>

      <Box
        style={{
          flex: 1,
          overflow: "auto",
          cursor: dragState || scrollDrag ? "grabbing" : undefined,
        }}
        ref={containerRef}
      >
        <Box style={{ display: "flex", minWidth: totalWidth + 150 }}>
          {/* Section Labels */}
          <Box
            style={{
              width: 150,
              flexShrink: 0,
              borderRight: "1px solid var(--mantine-color-gray-3)",
              position: "sticky",
              left: 0,
              backgroundColor: "var(--mantine-color-body)",
              zIndex: 10,
            }}
          >
            <Box
              style={{
                height: 25,
                borderBottom: "1px solid var(--mantine-color-gray-3)",
              }}
            />
            <Box
              style={{
                height: 30,
                borderBottom: "1px solid var(--mantine-color-gray-3)",
              }}
            />
            {SECTION_ORDER.map((sectionType) => {
              const rows = sectionRows[sectionType];
              const height = Math.max(rows.length, 1) * 36 + 12;
              return (
                <Box
                  key={sectionType}
                  style={{
                    height,
                    borderBottom: "1px solid var(--mantine-color-gray-3)",
                    display: "flex",
                    alignItems: "center",
                    padding: "0 8px",
                  }}
                >
                  <Badge
                    color={SECTION_CONFIG[sectionType].color}
                    variant="light"
                    size="sm"
                  >
                    {SECTION_CONFIG[sectionType].label}
                  </Badge>
                </Box>
              );
            })}
          </Box>

          {/* Timeline Grid */}
          <Box style={{ flex: 1, position: "relative" }}>
            {/* Year Headers */}
            <Box
              style={{
                display: "flex",
                height: 25,
                borderBottom: "1px solid var(--mantine-color-gray-3)",
              }}
            >
              {Array.from({ length: visibleYears }, (_, i) => {
                const year = startYear + i;
                return (
                  <Box
                    key={year}
                    style={{
                      width: monthWidth * 12,
                      flexShrink: 0,
                      borderRight: "2px solid var(--mantine-color-gray-4)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor:
                        year === dayjs().year()
                          ? "var(--mantine-color-blue-0)"
                          : undefined,
                    }}
                  >
                    <Text size="sm" fw={600}>
                      {year}
                    </Text>
                  </Box>
                );
              })}
            </Box>

            {/* Month Headers */}
            <Box
              style={{
                display: "flex",
                height: 30,
                borderBottom: "1px solid var(--mantine-color-gray-3)",
              }}
            >
              {monthsData.map((m) => (
                <MonthCell
                  key={m.key}
                  month={m.date}
                  monthWidth={monthWidth}
                  isCurrentMonth={m.isCurrentMonth}
                  isYearEnd={m.isYearEnd}
                />
              ))}
            </Box>

            {/* Section Rows */}
            {SECTION_ORDER.map((sectionType) => {
              const rows = sectionRows[sectionType];
              const height = Math.max(rows.length, 1) * 36 + 12;
              return (
                <Box
                  key={sectionType}
                  style={{
                    height,
                    borderBottom: "1px solid var(--mantine-color-gray-3)",
                    position: "relative",
                  }}
                >
                  {/* Grid lines */}
                  <Box
                    style={{
                      display: "flex",
                      height: "100%",
                      position: "absolute",
                      top: 0,
                      left: 0,
                      cursor: scrollDrag ? "grabbing" : "grab",
                    }}
                    onMouseDown={handleScrollDragStart}
                    onDoubleClick={(e) => handleGridDoubleClick(e, sectionType)}
                  >
                    {monthsData.map((m) => (
                      <GridCell
                        key={m.key}
                        monthKey={m.key}
                        monthWidth={monthWidth}
                        isCurrentMonth={m.isCurrentMonth}
                        isYearEnd={m.isYearEnd}
                      />
                    ))}
                  </Box>

                  {/* Entries */}
                  {rows.map((row, rowIndex) =>
                    row.map((entry) => {
                      const isDragging = dragState?.entryId === entry.id;
                      const previewDates = isDragging ? dragPreview : undefined;
                      const { left, width } = getEntryPosition(
                        entry,
                        previewDates || undefined
                      );

                      if (left + width < 0 || left > totalWidth) {
                        return null;
                      }

                      return (
                        <TimelineEntryItem
                          key={entry.id}
                          entry={previewDates ? { ...entry, startDate: previewDates.startDate, endDate: previewDates.endDate } : entry}
                          left={left}
                          width={width}
                          rowIndex={rowIndex}
                          isDragging={isDragging}
                          maxWidth={totalWidth}
                          onMouseDown={(e, type) => handleMouseDown(e, entry, type)}
                          onClick={(e) => {
                            if (!dragState) {
                              e.stopPropagation();
                              onEntryClick(entry);
                            }
                          }}
                        />
                      );
                    })
                  )}
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
