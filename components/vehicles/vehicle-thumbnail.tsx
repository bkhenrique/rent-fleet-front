import { Skeleton } from '@/components/ui/skeleton';

interface VehicleThumbnailProps {
  fotos: string[];
  alt: string;
  /** Classe de tamanho do quadrado (ex: `h-10 w-10`). Default pensado pra coluna de tabela. */
  className?: string;
}

const DEFAULT_SIZE_CLASS = 'h-10 w-10';

/**
 * Miniatura de veículo reaproveitável (lista de veículos, alertas do dashboard, etc). Mostra a
 * primeira foto (`fotos[0]`) no mesmo padrão de `photos-section.tsx` (img crua, sem otimização do
 * Next — as URLs vêm do MinIO/S3); se não houver foto ainda, mostra um `Skeleton` no lugar em vez
 * de deixar a célula vazia.
 */
export function VehicleThumbnail({ fotos, alt, className = DEFAULT_SIZE_CLASS }: VehicleThumbnailProps) {
  const [firstPhoto] = fotos;

  if (firstPhoto) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- fotos vêm de URLs externas do MinIO, sem otimização do Next
      <img src={firstPhoto} alt={alt} className={`aspect-square shrink-0 rounded object-cover ${className}`} />
    );
  }

  return <Skeleton className={`aspect-square shrink-0 ${className}`} />;
}
