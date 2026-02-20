"use client";

import { use } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { FaArrowLeft, FaCalendarAlt, FaDownload, FaUser } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import historyData from "@/src/data/history.json";

const LeadershipTable = ({ title, list }) => {
  if (!list || list.length === 0) return null;

  return (
    <div className="markdown-content border-t border-gray-100 pt-8">
      <h3 className="text-xl font-bold mb-6 text-primary">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse mb-6">
          <thead>
            <tr>
              <th className="bg-gray-50 border border-gray-200 px-4 py-2 text-center font-bold text-primary w-20">
                {/* 任次 */}
              </th>
              <th className="bg-gray-50 border border-gray-200 px-4 py-2 text-left font-bold text-primary">
                名字
              </th>
              <th className="bg-gray-50 border border-gray-200 px-4 py-2 text-center font-bold text-primary w-24">
                个人照
              </th>
              <th className="bg-gray-50 border border-gray-200 px-4 py-2 text-center font-bold text-primary">
                年份
              </th>
            </tr>
          </thead>
          <tbody>
            {list.map((person, index) => (
              <tr key={index}>
                <td className="border border-gray-200 px-4 py-2 text-gray-700 text-center font-medium">
                  {person.term}
                </td>
                <td className="border border-gray-200 px-4 py-2 text-gray-700 font-bold">
                  {person.name}
                </td>
                <td className="border border-gray-200 px-4 py-2 text-gray-700 text-center">
                  {person.image ? (
                    <img
                      src={person.image}
                      alt={person.name}
                      className="w-16 h-20 object-cover rounded-lg shadow-sm mx-auto"
                    />
                  ) : (
                    <div className="w-16 h-20 bg-gray-100 rounded-lg flex items-center justify-center mx-auto text-gray-400">
                      <FaUser className="text-2xl" />
                    </div>
                  )}
                </td>
                <td className="border border-gray-200 px-4 py-2 text-gray-700 text-center whitespace-nowrap">
                  {person.year}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default function HistoryDetailPage({ params }) {
  const { id } = use(params);
  const item = historyData.find((h) => h.id === id);

  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Content Not Found</h1>
          <Link
            href="/profile/history"
            className="text-primary hover:underline"
          >
            Back to Calendar
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-bg pt-28 pb-16">
      <div className="container-custom">
        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link
            href="/profile/history"
            className="inline-flex items-center text-gray-600 hover:text-primary transition-colors font-medium bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100"
          >
            <FaArrowLeft className="mr-2" />
            回到校史列表
          </Link>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {/* Header Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-gray-50 mb-12 relative overflow-hidden"
          >
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/5 rounded-full blur-3xl"></div>

            <div className="relative z-10">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-accent-yellow/10 rounded-xl flex items-center justify-center text-accent-yellow">
                  <FaCalendarAlt className="text-xl" />
                </div>
                <span className="text-lg font-bold text-gray-400">
                  {item.year}
                </span>
              </div>

              <h1 className="text-3xl md:text-5xl font-display font-bold text-primary mb-6">
                {item.title}
              </h1>

              <div className="w-24 h-1.5 bg-accent-yellow rounded-full mb-8"></div>

              <p className="text-xl text-gray-600 italic leading-relaxed">
                "{item.description}"
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-[2.5rem] p-8 md:p-16 shadow-xl border border-gray-50 space-y-12"
          >
            <div className="markdown-content">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
              >
                {item.content}
              </ReactMarkdown>
            </div>

            <LeadershipTable title="历任董事长" list={item.chairmanList} />
            <LeadershipTable title="历任校长" list={item.principalList} />
            <LeadershipTable title="历任家协主席" list={item.ptaList} />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
