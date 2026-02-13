import { Response } from 'express';
import * as skillsService from '../services/cli/skills-service';
import { asyncHandler } from '../middleware/async-handler';
import type { Request } from 'express';
import type { SkillListParams, SkillSearchParams, InstallSkillRequest, UpdateSkillApprovalRequest } from '../types';

/**
 * Clean error message to hide CLI internal details
 */
function cleanErrorMessage(error: string | undefined): string {
  if (!error) return 'Operation failed';

  // Remove CLI-specific paths and internal details
  let cleaned = error
    // Remove file paths
    .replace(/\/[^\s]+\/node_modules\/[^\s]+/g, '[internal]')
    .replace(/\/[^\s]+\.js:\d+:\d+/g, '[internal]')
    // Remove stack traces
    .replace(/at\s+[^\n]+/g, '')
    .replace(/Error:\s*/gi, '')
    // Remove npm/CLI specific output
    .replace(/npm\s+ERR!.*\n?/gi, '')
    .replace(/command\s+failed.*\n?/gi, '')
    // Clean up whitespace
    .replace(/\s+/g, ' ')
    .trim();

  // If message is too long or empty, use generic message
  if (!cleaned || cleaned.length > 200) {
    cleaned = 'Operation failed. Please try again.';
  }

  return cleaned;
}

/**
 * List Skills
 */
export const listSkills = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const params: SkillListParams = {
    status: req.query.status as SkillListParams['status'],
    search: req.query.search as string,
    page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
    limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
  };

  const result = await skillsService.listSkills(params);

  if (!result.success) {
    res.status(500).json({
      success: false,
      error: {
        code: 'SKILLS_ERROR',
        message: cleanErrorMessage(result.error),
      },
    });
    return;
  }

  res.json({ success: true, data: result.data });
});

/**
 * Get Skill by ID
 */
export const getSkill = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = await skillsService.getSkill(req.params.id);

  if (!result.success || !result.data) {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Skill not found',
      },
    });
    return;
  }

  res.json({ success: true, data: result.data });
});

/**
 * Search Marketplace
 */
export const searchMarketplace = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const params: SkillSearchParams = {
    query: req.query.query as string,
    category: req.query.category as string,
    sort: req.query.sort as SkillSearchParams['sort'],
    page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
    limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
  };

  const result = await skillsService.searchMarketplace(params);

  if (!result.success) {
    res.status(500).json({
      success: false,
      error: {
        code: 'MARKETPLACE_ERROR',
        message: cleanErrorMessage(result.error),
      },
    });
    return;
  }

  res.json({ success: true, data: result.data });
});

/**
 * Install Skill
 */
export const installSkill = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const request: InstallSkillRequest = {
    id: req.body.id,
    version: req.body.version,
    approve: req.body.approve,
  };

  if (!request.id) {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_REQUEST',
        message: 'Skill ID is required',
      },
    });
    return;
  }

  const result = await skillsService.installSkill(request);

  if (!result.success) {
    res.status(400).json({
      success: false,
      error: {
        code: 'INSTALL_FAILED',
        message: cleanErrorMessage(result.error),
      },
    });
    return;
  }

  res.status(201).json({ success: true, data: result.data });
});

/**
 * Uninstall Skill
 */
export const uninstallSkill = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = await skillsService.uninstallSkill(req.params.id);

  if (!result.success) {
    res.status(400).json({
      success: false,
      error: {
        code: 'UNINSTALL_FAILED',
        message: cleanErrorMessage(result.error),
      },
    });
    return;
  }

  res.json({ success: true, data: { message: 'Skill uninstalled successfully' } });
});

/**
 * Update Skill Approval
 */
export const updateSkillApproval = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const request: UpdateSkillApprovalRequest = {
    approved: req.body.approved,
    reason: req.body.reason,
  };

  const result = await skillsService.updateSkillApproval(req.params.id, request);

  if (!result.success) {
    res.status(400).json({
      success: false,
      error: {
        code: 'APPROVAL_FAILED',
        message: cleanErrorMessage(result.error),
      },
    });
    return;
  }

  res.json({ success: true, data: result.data });
});

/**
 * Toggle Skill (Enable/Disable)
 */
export const toggleSkill = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const enabled = req.body.enabled === true;
  const result = await skillsService.toggleSkill(req.params.id, enabled);

  if (!result.success) {
    res.status(400).json({
      success: false,
      error: {
        code: 'TOGGLE_FAILED',
        message: cleanErrorMessage(result.error),
      },
    });
    return;
  }

  res.json({ success: true, data: result.data });
});
