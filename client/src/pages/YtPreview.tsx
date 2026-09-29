import { useSearchParams } from 'react-router-dom'
import { yt_html } from '../assets/assets'

const YtPreview = () => {
  const [searchParams] = useSearchParams()

  const thumbnail_url = searchParams.get('thumbnail_url') || ''
  const title = searchParams.get('title') || 'AI Thumbnail Preview'

  const new_html = yt_html
    .replace(/%%THUMBNAIL_URL%%/g, thumbnail_url)
    .replace(/%%TITLE%%/g, title)

  return (
    <div className='fixed inset-0 z-100 bg-black flex flex-col'>
      <iframe srcDoc={new_html} className="w-full h-full border-none" allowFullScreen title="YouTube Preview"></iframe>
    </div>
  )
}

export default YtPreview
