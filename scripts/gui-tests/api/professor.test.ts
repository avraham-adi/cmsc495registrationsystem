import { describe, expect, it, vi, beforeEach } from 'vitest';
import { generateSectionAccessCodes, listProfessorSections, listSectionAccessCodes, mapSectionList, revokeSectionAccessCode, sortSectionsByCourse } from '../../../frontend/src/api/professor';

const { requestMock } = vi.hoisted(() => ({
	requestMock: vi.fn(),
}));

vi.mock('../../../frontend/src/api/client', () => ({
	request: requestMock,
}));

describe('professor api', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('lists professor sections through the profId filter', () => {
		listProfessorSections(5001);
		expect(requestMock).toHaveBeenCalledWith('/section?page=1&limit=100&profId=5001');
	});

	it('reads access codes for a section', () => {
		listSectionAccessCodes(10);
		expect(requestMock).toHaveBeenCalledWith('/section/10/access-codes');
	});

	it('generates section access codes', () => {
		generateSectionAccessCodes(10, 4);
		expect(requestMock).toHaveBeenCalledWith('/section/10/access-codes', { method: 'POST', body: { numCodes: 4 } });
	});

	it('revokes section access codes through the query string', () => {
		revokeSectionAccessCode(10, 'ABCD-1234');
		expect(requestMock).toHaveBeenCalledWith('/section/10/access-codes?codes=ABCD-1234', { method: 'DELETE' });
	});

	it('maps section list envelopes to raw sections', () => {
		const result = mapSectionList({ Section: [{ Section: { section_id: 1 } }, { Section: { section_id: 2 } }] } as never);
		expect(result).toEqual([{ section_id: 1 }, { section_id: 2 }]);
	});

	it('sorts sections by course code then section id', () => {
		const result = sortSectionsByCourse([
			{ section_id: 3, course: { course_code: 'CMSC495' } },
			{ section_id: 1, course: { course_code: 'CMSC350' } },
			{ section_id: 2, course: { course_code: 'CMSC350' } },
		] as never);
		expect(result.map((section) => section.section_id)).toEqual([1, 2, 3]);
	});

	it('preserves concurrent access-code requests independently', async () => {
		requestMock.mockResolvedValueOnce({ code1: 'ABCD-1234' }).mockResolvedValueOnce({ code1: 'WXYZ-9999' });

		const [one, two] = await Promise.all([listSectionAccessCodes(10), listSectionAccessCodes(11)]);

		expect(one).toEqual({ code1: 'ABCD-1234' });
		expect(two).toEqual({ code1: 'WXYZ-9999' });
	});
});
