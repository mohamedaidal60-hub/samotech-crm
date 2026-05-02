import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined');
}

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req: any, res: any) {
  const { method, body, query } = req;

  try {
    switch (method) {
      case 'GET':
        if (query.type === 'leads') {
          const leads = await sql`SELECT * FROM leads ORDER BY created_at DESC`;
          return res.status(200).json(leads);
        }
        if (query.type === 'projects') {
          if (query.id) {
            const project = await sql`SELECT * FROM projects WHERE id = ${query.id}`;
            return res.status(200).json(project[0]);
          }
          const projects = await sql`SELECT * FROM projects ORDER BY created_at DESC`;
          return res.status(200).json(projects);
        }
        if (query.type === 'voiceovers') {
          const voiceovers = await sql`SELECT * FROM voiceovers WHERE project_id = ${query.projectId} ORDER BY created_at DESC`;
          return res.status(200).json(voiceovers);
        }
        if (query.type === 'team') {
          const team = await sql`SELECT * FROM users ORDER BY name ASC`;
          return res.status(200).json(team);
        }
        break;

      case 'POST':
        if (body.type === 'new-lead') {
          const { first_name, last_name, company, phone, activities, notes } = body.data;
          const [lead] = await sql`
            INSERT INTO leads (first_name, last_name, company, phone, activities, notes)
            VALUES (${first_name}, ${last_name}, ${company}, ${phone}, ${activities}, ${notes})
            RETURNING *
          `;
          // Create an initial project for the lead
          const [project] = await sql`
            INSERT INTO projects (lead_id, name, type)
            VALUES (${lead.id}, ${company || (first_name + ' ' + last_name)}, 'media')
            RETURNING *
          `;
          return res.status(201).json({ lead, project });
        }
        if (body.type === 'voiceover') {
          const { project_id, filename, file_url, file_type } = body.data;
          const [vo] = await sql`
            INSERT INTO voiceovers (project_id, filename, file_url, type)
            VALUES (${project_id}, ${filename}, ${file_url}, ${file_type || 'audio'})
            RETURNING *
          `;
          return res.status(201).json(vo);
        }
        if (body.type === 'add-team-member') {
          const { name, email, role } = body.data;
          const [user] = await sql`
            INSERT INTO users (name, email, role)
            VALUES (${name}, ${email}, ${role})
            RETURNING *
          `;
          return res.status(201).json(user);
        }
        break;

      case 'PUT':
        if (body.type === 'update-project') {
          const { id, current_step, total_amount, paid_amount, script_content, status } = body.data;
          
          // Build update query dynamically or just update all
          const result = await sql`
            UPDATE projects 
            SET 
              current_step = COALESCE(${current_step}, current_step), 
              total_amount = COALESCE(${total_amount}, total_amount), 
              paid_amount = COALESCE(${paid_amount}, paid_amount),
              script_content = COALESCE(${script_content}, script_content),
              status = COALESCE(${status}, status),
              updated_at = CURRENT_TIMESTAMP
            WHERE id = ${id}
            RETURNING *
          `;
          return res.status(200).json(result[0]);
        }
        break;

      case 'DELETE':
        if (query.type === 'voiceover') {
          await sql`DELETE FROM voiceovers WHERE id = ${query.id}`;
          return res.status(200).json({ success: true });
        }
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}
