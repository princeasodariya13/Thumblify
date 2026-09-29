import { useEffect, useState } from "react"
import SoftBackdrop from "../components/SoftBackdrop"
import {  type IThumbnail } from "../assets/assets"
import {  Link, useNavigate } from "react-router-dom"
import { ArrowUpRightIcon, DownloadIcon, TrashIcon, EyeIcon, EyeOffIcon } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import api from "../configs/api"
import toast from "react-hot-toast"

const MyGeneration = () => {
  const { isLoggedIn } = useAuth()
  const navigate = useNavigate();

  const aspectRatioClassMap : Record<string, string> = {
    "16:9": "aspect-video",
    "1:1": "aspect-square",
    "9:16": "aspect-[9/16]"
  }

  const [thumbnails, setThumbnails] = useState<IThumbnail[]>([])
  const [loading, setLoading] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchThumbnail = async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/api/user/thumbnails')
      setThumbnails(data.thumbnails || [])
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = (image_url : string) => {
    const link = document.createElement('a');
    link.href = image_url.replace('/upload','/upload/fl_attachment')
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      setDeleting(true);
      const { data } = await api.delete(`/api/thumbnail/delete/${deleteTargetId}`);
      toast.success(data.message || "Thumbnail deleted successfully");
      setThumbnails(thumbnails.filter((t) => t._id !== deleteTargetId));
      setDeleteTargetId(null);
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to delete thumbnail");
    } finally {
      setDeleting(false);
    }
  }

  const handleTogglePublic = async (id: string) => {
    try {
      const { data } = await api.patch(`/api/thumbnail/toggle-public/${id}`);
      toast.success(data.message);
      setThumbnails(thumbnails.map((t) => 
        t._id === id ? { ...t, isPublic: data.isPublic } : t
      ));
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to update visibility");
    }
  }

  useEffect(() => {
    if (isLoggedIn) {
      fetchThumbnail()
    }
  }, [isLoggedIn])

  return (
    <>
    <SoftBackdrop/>
    <div className="mt-32 min-h-screen px-6 md:px-16 lg:px-24 xl:px-32">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-200">My Generation</h1>
        <p className="text-sm text-zinc-400 mt-1">
          View and manage all your AI-generated thumbnails
        </p>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({length: 6}).map((_,i)=>(
            <div key={i} className="rounded-2xl bg-white/6 border border-white/10 animate-pulse h-[260px]"/>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && thumbnails.length === 0 && (
        <div className="text-center py-24">
          <h3 className="text-lg font-semibold text-zinc-200">No thumbnails yet</h3>
          <p className="text-sm text-zinc-400 mt-2">Generate your first thumbnail to see it here</p>
        </div>
      )}

       {/* Grid Layout */}
    {!loading && thumbnails.length > 0 && (
      <div className="columns-1 sm:columns-2 lg:columns-3 2xl:columns-4 gap-8">
        {thumbnails.map((thumb: IThumbnail)=>{
          const aspectClass = aspectRatioClassMap[thumb.aspect_ratio || '16:9'];
          return(
            <div key={thumb._id} onClick={()=>navigate(`/generate/${thumb._id}`)} className="mb-8 group relative cursor-pointer rounded-2xl bg-white/6 border border-white/10 transition shadow-xl break-inside-avoid">
                
                {/* IMAGE */}
                <div className={`relative overflow-hidden rounded-t-2xl ${aspectClass} bg-black`}>
                  {thumb.image_url ? (
                    <img src={thumb.image_url} alt={thumb.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sm text-zinc-400">
                      {thumb.isGenerating ? 'Generating...' : 'No Image'}
                    </div>
                  )}

                  {thumb.isGenerating && <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-sm font-medium text-white">Generating...</div>}
                </div>

                {/* Content */}
                <div className="p-4 space-y-2">
                  <h3 className="text-sm font-semibold text-zinc-100 line-clamp-2">{thumb.title}</h3>

                  <div className="flex flex-wrap gap-2 text-xs text-zinc-400">
                    <span className="px-2 py-0.5 rounded bg-white/8">{thumb.style}</span>
                    <span className="px-2 py-0.5 rounded bg-white/8">{thumb.color_scheme}</span>
                    <span className="px-2 py-0.5 rounded bg-white/8">{thumb.aspect_ratio}</span>
                  </div>

                  <p className="text-xs text-zinc-500">{new Date(thumb.createdAt!).toDateString()}</p>
                </div>

                {/* Hover Icon Action Bar with Floating Tooltips */}
                <div onClick={(e)=>e.stopPropagation()} className="absolute bottom-2 right-2 max-sm:flex sm:hidden group-hover:flex items-center gap-1.5 z-20">
                  
                  {/* Eye Toggle Public Button */}
                  <div className="relative group/tooltip">
                    <button 
                      onClick={() => handleTogglePublic(thumb._id)}
                      className="size-7 bg-black/70 p-1.5 rounded-lg hover:bg-pink-600 transition-all cursor-pointer text-white flex items-center justify-center backdrop-blur-md border border-white/10"
                    >
                      {thumb.isPublic ? <EyeIcon className="size-full" /> : <EyeOffIcon className="size-full" />}
                    </button>
                    <div className="absolute -top-9 left-1/2 -translate-x-1/2 opacity-0 group-hover/tooltip:opacity-100 transition-all duration-200 pointer-events-none z-30">
                      <div className="bg-zinc-900/95 text-white border border-white/15 text-[11px] font-medium px-2 py-0.5 rounded-md shadow-xl whitespace-nowrap">
                        {thumb.isPublic ? "Make Private" : "Make Public"}
                      </div>
                      <div className="w-1.5 h-1.5 bg-zinc-900/95 rotate-45 mx-auto -mt-1 border-r border-b border-white/15"></div>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <div className="relative group/tooltip">
                    <button 
                      onClick={() => setDeleteTargetId(thumb._id)}
                      className="size-7 bg-black/70 p-1.5 rounded-lg hover:bg-pink-600 transition-all cursor-pointer text-white flex items-center justify-center backdrop-blur-md border border-white/10"
                    >
                      <TrashIcon className="size-full" />
                    </button>
                    <div className="absolute -top-9 left-1/2 -translate-x-1/2 opacity-0 group-hover/tooltip:opacity-100 transition-all duration-200 pointer-events-none z-30">
                      <div className="bg-zinc-900/95 text-white border border-white/15 text-[11px] font-medium px-2 py-0.5 rounded-md shadow-xl whitespace-nowrap">
                        Delete
                      </div>
                      <div className="w-1.5 h-1.5 bg-zinc-900/95 rotate-45 mx-auto -mt-1 border-r border-b border-white/15"></div>
                    </div>
                  </div>

                  {/* Download Button */}
                  <div className="relative group/tooltip">
                    <button 
                      onClick={() => handleDownload(thumb.image_url!)}
                      className="size-7 bg-black/70 p-1.5 rounded-lg hover:bg-pink-600 transition-all cursor-pointer text-white flex items-center justify-center backdrop-blur-md border border-white/10"
                    >
                      <DownloadIcon className="size-full" />
                    </button>
                    <div className="absolute -top-9 left-1/2 -translate-x-1/2 opacity-0 group-hover/tooltip:opacity-100 transition-all duration-200 pointer-events-none z-30">
                      <div className="bg-zinc-900/95 text-white border border-white/15 text-[11px] font-medium px-2 py-0.5 rounded-md shadow-xl whitespace-nowrap">
                        Download
                      </div>
                      <div className="w-1.5 h-1.5 bg-zinc-900/95 rotate-45 mx-auto -mt-1 border-r border-b border-white/15"></div>
                    </div>
                  </div>

                  {/* Preview Button */}
                  <div className="relative group/tooltip">
                    <Link 
                      target="_blank" 
                      to={`/preview?thumbnail_url=${encodeURIComponent(thumb.image_url || '')}&title=${encodeURIComponent(thumb.title)}`}
                      className="size-7 bg-black/70 p-1.5 rounded-lg hover:bg-pink-600 transition-all text-white flex items-center justify-center backdrop-blur-md border border-white/10 cursor-pointer"
                    >
                      <ArrowUpRightIcon className="size-full" />
                    </Link>
                    <div className="absolute -top-9 left-1/2 -translate-x-1/2 opacity-0 group-hover/tooltip:opacity-100 transition-all duration-200 pointer-events-none z-30">
                      <div className="bg-zinc-900/95 text-white border border-white/15 text-[11px] font-medium px-2 py-0.5 rounded-md shadow-xl whitespace-nowrap">
                        YT Preview
                      </div>
                      <div className="w-1.5 h-1.5 bg-zinc-900/95 rotate-45 mx-auto -mt-1 border-r border-b border-white/15"></div>
                    </div>
                  </div>

                </div> 

            </div>
          )
        })}
      </div>
    )}
    </div>

    {/* DELETE CONFIRMATION MODAL */}
    {deleteTargetId && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
        <div className="w-full max-w-sm rounded-2xl bg-zinc-900/95 border border-white/15 p-6 text-center shadow-2xl space-y-4">
          <div className="mx-auto size-12 rounded-full bg-pink-500/15 border border-pink-500/30 flex items-center justify-center text-pink-400">
            <TrashIcon className="size-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Delete Thumbnail</h3>
            <p className="text-xs text-zinc-400 mt-1">Are you sure you want to delete this thumbnail? This action cannot be undone.</p>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setDeleteTargetId(null)}
              disabled={deleting}
              className="flex-1 py-2.5 rounded-xl border border-white/12 text-sm font-medium text-zinc-300 hover:bg-white/5 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              disabled={deleting}
              className="flex-1 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-sm font-medium text-white transition cursor-pointer"
            >
              {deleting ? 'Deleting...' : 'Yes, Delete'}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  )
}

export default MyGeneration