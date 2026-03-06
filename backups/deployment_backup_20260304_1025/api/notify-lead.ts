import type { VercelRequest, VercelResponse } from '@vercel/node'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

const resend = new Resend(process.env.RESEND_API_KEY)
const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Supabase Webhook passes data in req.body.record
    // For manual testing, we use req.body directly
    const record = req.body.record || req.body

    if (!record || !record.agency_id) {
        return res.status(400).json({ error: 'No lead record provided' })
    }

    try {
        // 1. Fetch agency and property details
        const { data: agency, error: agencyError } = await supabase
            .from('agencies')
            .select('name, email')
            .eq('id', record.agency_id)
            .single()

        if (agencyError || !agency) {
            throw new Error(`Agency not found: ${agencyError?.message}`)
        }

        let propertyTitle = 'General Inquiry'
        if (record.property_id) {
            const { data: property } = await supabase
                .from('properties')
                .select('title')
                .eq('id', record.property_id)
                .single()
            if (property) propertyTitle = property.title
        }

        // 2. Send email via Resend
        const { data, error } = await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || 'leads@maltaluxuryestates.com',
            to: agency.email,
            subject: `🏠 New Lead: ${propertyTitle}`,
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #C5A059;">New Lead Captured</h2>
          <p>Hi ${agency.name},</p>
          <p>You have a new inquiry for: <strong>${propertyTitle}</strong></p>
          
          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; border: 1px solid #eee;">
            <p><strong>Name:</strong> ${record.name}</p>
            <p><strong>Email:</strong> ${record.email}</p>
            <p><strong>Phone:</strong> ${record.phone || 'N/A'}</p>
            <p><strong>Intent:</strong> ${record.intent || 'Info'}</p>
            <p><strong>Budget:</strong> ${record.budget_max ? 'Up to €' + record.budget_max.toLocaleString() : 'N/A'}</p>
          </div>

          <p style="margin-top: 20px;">
            <a href="${process.env.VITE_URL}/agency/portal" 
               style="background: #C5A059; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
               View in Agency Portal
            </a>
          </p>

          <hr style="margin-top: 40px; border: 0; border-top: 1px solid #eee;" />
          <p style="font-size: 12px; color: #999;">
            This is an automated notification from Malta Luxury Real Estate.
          </p>
        </div>
      `
        })

        if (error) {
            return res.status(400).json({ error })
        }

        return res.status(200).json({ success: true, data })
    } catch (err: any) {
        console.error('Lead notification error:', err)
        return res.status(500).json({ error: err.message })
    }
}
