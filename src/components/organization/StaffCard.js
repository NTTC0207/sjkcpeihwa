import { motion } from "framer-motion";
import { HiUser } from "react-icons/hi2";
import { formatGoogleDriveLink } from "@lib/utils";

export default function StaffCard({ staff, getRole, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group"
    >
      <div className="h-24 bg-gradient-to-r from-primary/10 to-primary/5 group-hover:from-primary/20 transition-all duration-500 flex items-start justify-center pt-4">
        <span className="text-primary font-bold text-[10px] uppercase tracking-wider px-3 py-1 bg-white/80 backdrop-blur-sm rounded-full border border-primary/10 shadow-sm transition-transform group-hover:scale-105">
          {getRole(staff)}
        </span>
      </div>
      <div className="px-6 pb-6 -mt-10 flex flex-col items-center">
        <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-lg mb-4 group-hover:scale-105 transition-transform duration-300">
          <div className="w-full h-full rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
            {staff.image ? (
              <img
                src={formatGoogleDriveLink(staff.image)}
                alt={staff.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary/20">
                <HiUser className="w-12 h-12" />
              </div>
            )}
          </div>
        </div>

        <div className="text-center mb-4">
          {staff.name_zh && (
            <h3 className="font-display font-bold text-gray-800 text-xl group-hover:text-primary transition-colors leading-tight">
              {staff.name_zh}
            </h3>
          )}
          <h4
            className={`font-display font-medium text-center transition-colors ${
              staff.name_zh
                ? "text-gray-500 text-sm mt-0.5"
                : "text-gray-800 text-lg"
            }`}
          >
            {staff.name}
          </h4>
        </div>

        <div className="w-full pt-4 border-t border-gray-50 flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="font-medium">Category</span>
            <span className="bg-gray-100 px-2 py-0.5 rounded-md text-gray-700">
              {staff.category}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {staff.subject?.map((s) => (
              <span
                key={s}
                className="text-[10px] font-medium bg-primary/5 text-primary px-2.5 py-1 rounded-lg border border-primary/10"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
