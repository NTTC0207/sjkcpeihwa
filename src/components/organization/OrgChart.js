import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { HiUser, HiPlus, HiMinus, HiArrowPath } from "react-icons/hi2";

const springConfig = { type: "spring", damping: 30, stiffness: 150 };

export default function OrgChart({ staffTree, getRole }) {
  const [scale, setScale] = useState(1);
  const [showInstructions, setShowInstructions] = useState(true);
  const constraintsRef = useRef(null);
  const chartRef = useRef(null);
  const controls = useAnimation();

  const fitToScreen = useCallback(() => {
    if (constraintsRef.current && chartRef.current) {
      const containerWidth = constraintsRef.current.offsetWidth - 80;
      const containerHeight = constraintsRef.current.offsetHeight - 80;
      const chartWidth = chartRef.current.scrollWidth;
      const chartHeight = chartRef.current.scrollHeight;

      if (chartWidth > 0 && chartHeight > 0) {
        const scaleX = containerWidth / chartWidth;
        const scaleY = containerHeight / chartHeight;
        const newScale = Math.min(scaleX, scaleY, 1);
        setScale(newScale * 0.9);
      }
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(fitToScreen, 100);
    const observer = new ResizeObserver(() => fitToScreen());
    if (chartRef.current) observer.observe(chartRef.current);
    window.addEventListener("resize", fitToScreen);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
      window.removeEventListener("resize", fitToScreen);
    };
  }, [fitToScreen]);

  useEffect(() => {
    controls.start({ scale });
  }, [scale, controls]);

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.2, 2));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.4));
  const handleReset = () => {
    controls.start({ x: 0, y: 0 });
    fitToScreen();
  };

  return (
    <div className="relative w-full h-[700px] bg-white rounded-3xl border border-gray-100 shadow-inner overflow-hidden cursor-grab active:cursor-grabbing">
      {/* Zoom Controls */}
      <div className="absolute bottom-8 right-8 flex flex-col gap-3 z-30">
        <button
          onClick={handleZoomIn}
          className="p-3 bg-white shadow-xl rounded-2xl border border-gray-100 text-primary hover:bg-gray-50 transition-all hover:scale-110 active:scale-95"
          title="Zoom In"
        >
          <HiPlus className="w-6 h-6" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-3 bg-white shadow-xl rounded-2xl border border-gray-100 text-primary hover:bg-gray-50 transition-all hover:scale-110 active:scale-95"
          title="Zoom Out"
        >
          <HiMinus className="w-6 h-6" />
        </button>
        <button
          onClick={handleReset}
          className="p-3 bg-white shadow-xl rounded-2xl border border-gray-100 text-primary hover:bg-gray-50 transition-all hover:scale-110 active:scale-95"
          title="Reset"
        >
          <HiArrowPath className="w-6 h-6" />
        </button>
      </div>

      {/* Instructions Overlay */}
      <AnimatePresence>
        {showInstructions && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%", scale: [1, 1.05, 1] }}
            exit={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
            transition={{
              duration: 0.5,
              scale: { repeat: Infinity, duration: 2, ease: "easeInOut" },
            }}
            className="absolute top-6 left-1/2 z-20 pointer-events-none"
          >
            <div className="bg-primary/90 backdrop-blur-md text-white text-xs font-bold px-6 py-2.5 rounded-full shadow-2xl border border-white/20 whitespace-nowrap">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-accent-yellow rounded-full animate-pulse" />
                Drag to Pan • Use Buttons to Zoom
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        ref={constraintsRef}
        className="w-full h-full flex items-center justify-center overflow-auto p-10 no-scrollbar"
      >
        <motion.div
          drag
          dragConstraints={constraintsRef}
          onDragStart={() => setShowInstructions(false)}
          animate={controls}
          initial={{ scale: 1, x: 0, y: 0 }}
          transition={{ type: "spring", damping: 30, stiffness: 200 }}
          className="p-10"
          style={{ transformOrigin: "center center" }}
        >
          <motion.div ref={chartRef} className="inline-flex justify-center">
            <TreeLevel nodes={staffTree} getRole={getRole} />
          </motion.div>
        </motion.div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .org-tree-node-connector-down { width: 2px; height: 40px; background-color: #cbd5e1; margin: 0 auto; position: relative; }
        .org-tree-child-connector-up { width: 2px; height: 40px; background-color: #cbd5e1; margin-top: -40px; margin-bottom: 0; position: relative; z-index: 0; }
        .org-tree-children-container { display: flex; justify-content: center; position: relative; padding-top: 40px; gap: 40px; }
      `,
        }}
      />
    </div>
  );
}

function TreeLevel({ nodes, getRole }) {
  const [showChildren, setShowChildren] = useState(true);

  // Split nodes into those to display now (min level) and those for later
  const { currentLevelNodes, nextLevelNodes } = useMemo(() => {
    if (!nodes || nodes.length === 0)
      return { currentLevelNodes: [], nextLevelNodes: [] };

    // Find the minimum level in the current set
    const minLevel = Math.min(...nodes.map((n) => n.level ?? 999));

    // Nodes at exactly this level, sorted by order property
    const current = nodes
      .filter((n) => (n.level ?? 999) === minLevel)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    // Nodes at a higher level (to be pushed down)
    const remaining = nodes.filter((n) => (n.level ?? 999) > minLevel);

    const nextMap = new Map();
    // 1. Add nodes that were skipped this time (remaining from current level)
    remaining.forEach((node) => nextMap.set(node.id, node));

    // 2. Add direct children of current level nodes
    current.forEach((node) => {
      node.children?.forEach((child) => {
        // Only add if not already in the nextMap or if it's a new occurrence
        nextMap.set(child.id, child);
      });
    });

    return {
      currentLevelNodes: current,
      nextLevelNodes: Array.from(nextMap.values()).sort((a, b) => {
        if ((a.level ?? 999) !== (b.level ?? 999)) {
          return (a.level ?? 999) - (b.level ?? 999);
        }
        return (a.order ?? 0) - (b.order ?? 0);
      }),
    };
  }, [nodes]);

  const hasChildren = nextLevelNodes.length > 0;

  return (
    <div className="flex flex-col items-center">
      {/* Current Level Nodes */}
      <div className="flex flex-row justify-center gap-10">
        {currentLevelNodes.map((node, idx) => (
          <NodeCard
            key={node.id}
            node={node}
            getRole={getRole}
            index={idx}
            total={currentLevelNodes.length}
            showChildren={showChildren}
            setShowChildren={setShowChildren}
            hasLocalChildren={
              node.children?.length > 0 ||
              nextLevelNodes.some(
                (n) => n.parentId === node.id || n.parentIds?.includes(node.id),
              )
            }
          />
        ))}
      </div>

      {/* Next Level Nodes (Remaining + Children) */}
      <AnimatePresence mode="popLayout">
        {hasChildren && showChildren && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={springConfig}
            className="w-full flex flex-col items-center"
          >
            <div className="org-tree-node-connector-down" />
            <div className="org-tree-children-container">
              <TreeLevel nodes={nextLevelNodes} getRole={getRole} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NodeCard({
  node,
  getRole,
  index,
  total,
  showChildren,
  setShowChildren,
  hasLocalChildren,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isFirst = index === 0;
  const isLast = index === total - 1;
  const isOnlyNode = total === 1;
  const hasParent =
    node.parentId || (node.parentIds && node.parentIds.length > 0);

  return (
    <div className="relative flex flex-col items-center">
      {/* Horizontal Connector Lines (Top) */}
      {hasParent && !isOnlyNode && (
        <>
          {!isFirst && (
            <div
              className="absolute top-0 left-0 w-1/2 h-[2px] bg-slate-300 -translate-y-[40px]"
              style={{ left: "-20px", width: "calc(50% + 20px)" }}
            />
          )}
          {!isLast && (
            <div
              className="absolute top-0 right-0 w-1/2 h-[2px] bg-slate-300 -translate-y-[40px]"
              style={{ right: "-20px", width: "calc(50% + 20px)" }}
            />
          )}
        </>
      )}

      {/* Vertical Connector (Top) */}
      {hasParent && <div className="org-tree-child-connector-up" />}

      {/* The Card */}
      <motion.div
        layout
        transition={springConfig}
        whileHover={{
          y: -8,
          scale: 1.02,
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
        }}
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex flex-col items-center p-5 bg-white rounded-3xl shadow-xl border border-slate-100 w-64 z-10 cursor-pointer relative"
      >
        <div className="relative mb-4">
          <div className="w-24 h-24 rounded-full bg-slate-50 overflow-hidden ring-4 ring-white shadow-inner">
            {node.image ? (
              <img
                src={node.image}
                alt={node.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary/20">
                <HiUser className="w-14 h-14" />
              </div>
            )}
          </div>
        </div>

        <div className="text-center mb-1">
          {node.name_zh && (
            <h3 className="font-display font-bold text-slate-800 text-lg leading-tight">
              {node.name_zh}
            </h3>
          )}
          <h4
            className={`font-display font-medium transition-colors ${node.name_zh ? "text-slate-500 text-xs" : "text-slate-800 text-lg"}`}
          >
            {node.name}
          </h4>
        </div>
        <p className="text-primary font-bold text-xs uppercase tracking-wider text-center px-3 py-1 bg-primary/5 rounded-full mb-2">
          {getRole(node)}
        </p>

        {/* Toggle Button */}
        {hasLocalChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowChildren(!showChildren);
            }}
            className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full border border-slate-200 shadow-md flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all z-20 group"
          >
            {showChildren ? (
              <HiMinus className="w-4 h-4" />
            ) : (
              <HiPlus className="w-4 h-4" />
            )}
          </button>
        )}
      </motion.div>
    </div>
  );
}
