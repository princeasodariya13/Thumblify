import { useSearchParams, useNavigate } from 'react-router-dom'
import { yt_html } from '../assets/assets'

const YtPreview = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const thumbnail_url = searchParams.get('thumbnail_url') || ''
  const title = searchParams.get('title') || 'AI Thumbnail Preview'

  const new_html = yt_html
    .replace(/%%THUMBNAIL_URL%%/g, thumbnail_url)
    .replace(/%%TITLE%%/g, title)

  return (
    <div className='fixed inset-0 z-100 bg-black flex flex-col'>
      {/* Floating Close Control Bar */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={() => navigate(-1)}
          className="bg-zinc-900/90 text-white border border-white/20 text-xs font-semibold px-4 py-2 rounded-full shadow-xl hover:bg-pink-600 transition flex items-center gap-1.5 cursor-pointer backdrop-blur-md"
        >
          ✕ Close Preview
        </button>
      </div>

      <iframe srcDoc={new_html} className="w-full h-full border-none" allowFullScreen title="YouTube Preview"></iframe>
    </div>
  )
}

export default YtPreview