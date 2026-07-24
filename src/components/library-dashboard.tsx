"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type Book = { id: string; title: string; author: string | null; category: string | null; copies: number; available: number; isbn: string | null };
type Transaction = { id: string; book: { title: string }; studentId: string; issueDate: Date; dueDate: Date; returnDate: Date | null; fine: number };
type Student = { id: string; name: string; admissionNo: string };

export function LibraryDashboard({ books, transactions, students, schoolId }: { books: Book[]; transactions: Transaction[]; students: Student[]; schoolId: string }) {
  const totalBooks = books.reduce((sum, b) => sum + b.copies, 0);
  const totalAvailable = books.reduce((sum, b) => sum + b.available, 0);

  const [showAddBook, setShowAddBook] = useState(false);
  const [showIssue, setShowIssue] = useState(false);
  const [bookTitle, setBookTitle] = useState("");
  const [bookAuthor, setBookAuthor] = useState("");
  const [bookCategory, setBookCategory] = useState("");
  const [bookCopies, setBookCopies] = useState(1);
  const [bookIsbn, setBookIsbn] = useState("");
  const [issueBookId, setIssueBookId] = useState("");
  const [issueStudentId, setIssueStudentId] = useState("");
  const [loading, setLoading] = useState(false);

  async function addBook(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/library", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ schoolId, title: bookTitle, author: bookAuthor || null, category: bookCategory || null, copies: bookCopies, isbn: bookIsbn || null }),
    });
    if (res.ok) window.location.reload();
    setLoading(false);
  }

  async function issueBook(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/library/issue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookId: issueBookId, studentId: issueStudentId }),
    });
    if (res.ok) window.location.reload();
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Total Titles</p>
          <p className="text-2xl font-bold text-gray-900">{books.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Total Copies</p>
          <p className="text-2xl font-bold text-gray-900">{totalBooks}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Available</p>
          <p className="text-2xl font-bold text-green-600">{totalAvailable}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => { setShowAddBook(!showAddBook); setShowIssue(false); }}
          className="bg-black text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-black/80 transition"
        >
          {showAddBook ? "Cancel" : "Add Book"}
        </button>
        <button
          onClick={() => { setShowIssue(!showIssue); setShowAddBook(false); }}
          className="bg-white border border-gray-200 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-gray-50 transition"
        >
          {showIssue ? "Cancel" : "Issue Book"}
        </button>
      </div>

      {/* Add Book Form */}
      {showAddBook && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-sm mb-3">Add New Book</h3>
          <form onSubmit={addBook} className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs text-gray-500 mb-1 block">Title *</label>
              <input type="text" value={bookTitle} onChange={(e) => setBookTitle(e.target.value)} required placeholder="e.g. Mathematics Grade 5" className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Author</label>
              <input type="text" value={bookAuthor} onChange={(e) => setBookAuthor(e.target.value)} placeholder="e.g. J. Kamau" className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Category</label>
              <input type="text" value={bookCategory} onChange={(e) => setBookCategory(e.target.value)} placeholder="e.g. Textbook" className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Copies</label>
              <input type="number" value={bookCopies} onChange={(e) => setBookCopies(parseInt(e.target.value))} min={1} className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">ISBN</label>
              <input type="text" value={bookIsbn} onChange={(e) => setBookIsbn(e.target.value)} placeholder="Optional" className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div className="col-span-2">
              <button type="submit" disabled={loading || !bookTitle} className="bg-black text-white text-xs font-medium px-4 py-1.5 rounded-lg hover:bg-black/80 transition disabled:opacity-50">
                {loading ? "Adding..." : "Add Book"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Issue Book Form */}
      {showIssue && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-sm mb-3">Issue Book to Student</h3>
          <form onSubmit={issueBook} className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Book *</label>
              <select value={issueBookId} onChange={(e) => setIssueBookId(e.target.value)} required className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm">
                <option value="">Select book</option>
                {books.filter((b) => b.available > 0).map((b) => (
                  <option key={b.id} value={b.id}>{b.title} ({b.available} available)</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Student *</label>
              <select value={issueStudentId} onChange={(e) => setIssueStudentId(e.target.value)} required className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm">
                <option value="">Select student</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.admissionNo})</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <button type="submit" disabled={loading || !issueBookId || !issueStudentId} className="bg-black text-white text-xs font-medium px-4 py-1.5 rounded-lg hover:bg-black/80 transition disabled:opacity-50">
                {loading ? "Issuing..." : "Issue Book"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Book Catalog */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold">Book Catalog</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Copies</TableHead>
              <TableHead>Available</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {books.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-gray-500">No books yet. Click &quot;Add Book&quot; above.</TableCell></TableRow>
            ) : (
              books.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium">{b.title}</TableCell>
                  <TableCell className="text-sm">{b.author || "-"}</TableCell>
                  <TableCell><Badge variant="outline">{b.category || "General"}</Badge></TableCell>
                  <TableCell>{b.copies}</TableCell>
                  <TableCell>
                    <span className={b.available > 0 ? "text-green-600" : "text-red-600"}>{b.available}</span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Active Issues */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold">Active Issues ({transactions.length})</h3>
        </div>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No active issues.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Book</TableHead>
                <TableHead>Issued</TableHead>
                <TableHead>Due</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((t) => {
                const isOverdue = new Date(t.dueDate) < new Date();
                return (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.book.title}</TableCell>
                    <TableCell className="text-sm">{new Date(t.issueDate).toLocaleDateString()}</TableCell>
                    <TableCell className="text-sm">{new Date(t.dueDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {isOverdue ? <Badge className="bg-red-100 text-red-700">Overdue</Badge> : <Badge className="bg-green-100 text-green-700">Active</Badge>}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
