/*
Adi Avraham
CMSC495 Group Golf Capstone Project
section.routes.js
input
runtime requests, imported dependencies, and function arguments
output
exported modules, rendered UI, or application side effects
description
Defines the section API routes for public reads and privileged section operations.
*/

import { Router } from 'express';
import SectionController from '../controllers/section.controller.js';
import auth, { flMw as flm } from '../../middleware/session.middleware.js';
import { default as roles } from '../../middleware/rbac.middleware.js';
import { validateBody as body, validateParams as params, validateQuery as query } from '../middleware/validateRequest.middleware.js';
import { generateAccessCodesBodySchema as gen, getAllSectionsQuerySchema as sections, revokeAccessCodesQuerySchema as rev, sectionBodySchema as section } from '../schemas/section.schemas.js';
import { cIdParamSchema as courseId, idParamSchema as id } from '../schemas/common.schema.js';

const r = Router();
const c = new SectionController();

// Public Section Routes
r.get('/', query(sections), c.getSections);
r.get('/:id', params(id), c.getSection);

// Protected Section Routes (Requires ADMIN authorization)
r.post('/:cId', auth, flm(), roles('ADMIN'), params(courseId), body(section), c.addSection);
r.put('/:id', auth, flm(), roles('ADMIN'), params(id), body(section), c.updSection);
r.delete('/:id', auth, flm(), roles('ADMIN'), params(id), c.rmvSection);

// Protected Section Routes (Requires PROFESSOR or ADMIN authorization)
r.get('/:id/access-codes', auth, flm(), roles('ADMIN', 'PROFESSOR'), params(id), c.getAcCodes);
r.post('/:id/access-codes', auth, flm(), roles('ADMIN', 'PROFESSOR'), params(id), body(gen), c.genAcCodes);
r.delete('/:id/access-codes', auth, flm(), roles('ADMIN', 'PROFESSOR'), params(id), query(rev), c.revAcCodes);
export default r;
