import { Request, Response } from 'express';
import { TemplateService } from './template.service';
import { handleCreate, handleDelete, handleGetById, handleSearch, handleUpdate } from '@/core/utils/handler';

const templateService = new TemplateService();

export class TemplateController {
  // Search templates
  search = handleSearch((params) => templateService.find(params));

  // Get template by ID
  getById = handleGetById((id) => templateService.findById(id));

  // Create new template
  create = handleCreate((data, userId) => templateService.create(data));

  // Update template
  update = handleUpdate((id, data, userId) => templateService.update(id, data));

  // Delete template (soft delete)
  remove = handleDelete((id, userId) => templateService.delete(id));
}