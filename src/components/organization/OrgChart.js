import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { HiUser, HiPlus, HiMinus, HiArrowPath } from "react-icons/hi2";

export default function OrgChart({ staffTree, getRole }) {
  const [scale, setScale] = useState(1);
  const [showInstructions, setShowInstructions] = useState(true);
  const constraintsRef = useRef(null);
  const chartRef = useRef(null);
  const controls = useAnimation();

  const fitToScreen = useCallback(() => {
    if (constraintsRef.current && chartRef.current) {
      const containerWidth = constraintsRef.current.offsetWidth - 80; // Padding
      const containerHeight = constraintsRef.current.offsetHeight - 80;
      const chartWidth = chartRef.current.scrollWidth;
      const chartHeight = chartRef.current.scrollHeight;

      if (chartWidth > 0 && chartHeight > 0) {
        const scaleX = containerWidth / chartWidth;
        const scaleY = containerHeight / chartHeight;
        const newScale = Math.min(scaleX, scaleY, 1); // Don't upscale past 1
        setScale(newScale * 0.9); // Add a small buffer
      }
    }
  }, [controls]);

  useEffect(() => {
    // Initial fit
    const timer = setTimeout(fitToScreen, 100);

    // Watch for size changes in the chart (e.g., when a card expands)
    const observer = new ResizeObserver(() => {
      fitToScreen();
    });

    if (chartRef.current) {
      observer.observe(chartRef.current);
    }

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
            animate={{
              opacity: 1,
              y: 0,
              x: "-50%",
              scale: [1, 1.05, 1],
            }}
            exit={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
            transition={{
              duration: 0.5,
              scale: {
                repeat: Infinity,
                duration: 2,
                ease: "easeInOut",
              },
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

      {/* Chart Canvas */}
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
          <motion.div
            ref={chartRef}
            layout
            className="inline-flex flex-col items-center"
          >
            {staffTree.map((node, idx) => (
              <TreeNode
                key={node.id}
                node={node}
                getRole={getRole}
                index={idx}
                total={staffTree.length}
              />
            ))}
          </motion.div>
        </motion.div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .org-tree-node {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .org-tree-children {
          display: flex;
          justify-content: center;
          position: relative;
          padding-top: 40px;
          margin-top: 0;
          gap: 40px;
        }

        /* Vertical line from parent node down to the horizontal line */
        .org-tree-node-connector-down {
          width: 2px;
          height: 40px;
          background-color: #cbd5e1; /* slate-300 */
          position: relative;
        }

        /* Vertical line from the horizontal bar down to each child node */
        .org-tree-child-connector-up {
          width: 2px;
          height: 40px;
          background-color: #cbd5e1;
          margin-top: -40px;
          margin-bottom: 0;
          position: relative;
          z-index: 0;
        }
      `,
        }}
      />
    </div>
  );
}

function TreeNode({ node, getRole, index, total }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showChildren, setShowChildren] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  const isFirst = index === 0;
  const isLast = index === (total || 1) - 1;
  const isOnlyChild = total === 1;

  const springConfig = { type: "spring", damping: 30, stiffness: 150 };

  return (
    <motion.div layout transition={springConfig} className="org-tree-node">
      {/* Horizontal Connector Lines for children tree */}
      {node.parentId && !isOnlyChild && (
        <>
          {!isFirst && (
            <motion.div
              layout
              transition={springConfig}
              className="absolute top-0 left-0 w-1/2 h-[2px] bg-slate-300 -translate-y-[40px] z-0"
              style={{ left: "-20px", width: "calc(50% + 20px)" }}
            />
          )}
          {!isLast && (
            <motion.div
              layout
              transition={springConfig}
              className="absolute top-0 right-0 w-1/2 h-[2px] bg-slate-300 -translate-y-[40px] z-0"
              style={{ right: "-20px", width: "calc(50% + 20px)" }}
            />
          )}
        </>
      )}

      {/* Connector from above (for children) */}
      {node.parentId && <div className="org-tree-child-connector-up"></div>}

      {/* Node Card */}
      <motion.div
        layout
        transition={springConfig}
        whileHover={{
          y: -8,
          scale: 1.02,
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
        }}
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex flex-col items-center p-5 bg-white rounded-3xl shadow-xl border border-slate-100 w-64 z-10 transition-shadow duration-300 cursor-pointer relative"
      >
        <div className="relative mb-4 pointer-events-none">
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

        <div className="text-center mb-1 pointer-events-none">
          {node.name_zh && (
            <h3 className="font-display font-bold text-slate-800 text-lg leading-tight">
              {node.name_zh}
            </h3>
          )}
          <h4
            className={`font-display font-medium transition-colors ${
              node.name_zh ? "text-slate-500 text-xs" : "text-slate-800 text-lg"
            }`}
          >
            {node.name}
          </h4>
        </div>
        <p className="text-primary font-bold text-xs uppercase tracking-wider text-center px-3 py-1 bg-primary/5 rounded-full mb-2 pointer-events-none">
          {getRole(node)}
        </p>

        {/* Children Toggle Button */}
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowChildren(!showChildren);
            }}
            className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full border border-slate-200 shadow-md flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all duration-300 z-20 group"
          >
            {showChildren ? (
              <HiMinus className="w-4 h-4 transition-transform group-hover:scale-110" />
            ) : (
              <HiPlus className="w-4 h-4 transition-transform group-hover:scale-110" />
            )}
          </button>
        )}
      </motion.div>

      {/* Connector lines and Children */}
      <AnimatePresence mode="popLayout">
        {hasChildren && showChildren && (
          <motion.div
            layout
            key="children-container"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={springConfig}
            className="w-full flex flex-col items-center"
          >
            {node.children.length > 5 ? (
              <div className="flex flex-col items-center relative w-full">
                {/* Initial connector from parent card */}
                <div className="org-tree-node-connector-down"></div>

                {(() => {
                  const chunks = [];
                  const chunkSize = 4;
                  for (let i = 0; i < node.children.length; i += chunkSize) {
                    chunks.push(node.children.slice(i, i + chunkSize));
                  }
                  return chunks.map((chunk, chunkIdx) => (
                    <div
                      key={chunkIdx}
                      className="flex flex-col items-center w-full relative z-10"
                    >
                      <motion.div layout className="org-tree-children">
                        {chunk.map((child, idx) => (
                          <TreeNode
                            key={child.id}
                            node={child}
                            getRole={getRole}
                            index={idx}
                            total={chunk.length}
                          />
                        ))}
                      </motion.div>
                      {/* Vertical line connecting to the next row, if not the last row */}
                      {chunkIdx < chunks.length - 1 && (
                        <div className="org-tree-node-connector-down"></div>
                      )}
                    </div>
                  ));
                })()}
              </div>
            ) : (
              <>
                <div className="org-tree-node-connector-down"></div>
                <motion.div layout className="org-tree-children">
                  {node.children.map((child, idx) => (
                    <TreeNode
                      key={child.id}
                      node={child}
                      getRole={getRole}
                      index={idx}
                      total={node.children.length}
                    />
                  ))}
                </motion.div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
