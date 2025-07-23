'use server'

import { createClient } from "@/lib/supabase/server"

export async function getStamps() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, message: "Not authenticated", data: [] }
  }

  const { data, error } = await supabase
    .from('stamps')
    .select(`
      id,
      name,
      purchase_date,
      valuation,
      status,
      stamp_images ( image_url, image_type )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching stamps:', error);
    return { success: false, message: error.message, data: [] };
  }
  
  const stampsWithThumbnails = data.map(stamp => {
      const thumbnail = stamp.stamp_images.find(img => img.image_type === 'thumbnail');
      return {
          ...stamp,
          thumbnail_url: thumbnail ? thumbnail.image_url : null,
          stamp_images: undefined, // remove the full array of images
      }
  })

  return { success: true, message: 'Stamps fetched successfully', data: stampsWithThumbnails };
}
