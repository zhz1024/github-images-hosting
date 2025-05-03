import { ImageGallery } from "@/components/image-gallery"
import { UploadForm } from "@/components/upload-form"
import { Header } from "@/components/header"

export default function Home() {
  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <Header />
        <div className="grid gap-8 md:grid-cols-[1fr_300px]">
          <div className="order-2 md:order-1">
            <ImageGallery />
          </div>
          <div className="order-1 md:order-2">
            <UploadForm />
          </div>
        </div>
      </div>
    </main>
  )
}
