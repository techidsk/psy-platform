import { NextRequest } from 'next/server';
import { describe, expect, it, vi } from 'vitest';
import { GET } from '../app/api/log/[id]/route';
import { getUserExperimentHistory } from '@/lib/user_experment_history';

vi.mock('@/lib/user_experment_history', () => ({ getUserExperimentHistory: vi.fn() }));
vi.mock('@/lib/logger', () => ({ logger: { error: vi.fn() } }));

describe('single log export options', () => {
    const values = [undefined, true, false];
    for (const experiment of values) {
        for (const input of values) {
            it(`forwards experiment=${experiment}, input=${input}`, async () => {
                const url = new URL('http://localhost/api/log/sample?part=1');
                if (experiment !== undefined) {
                    url.searchParams.set('includeExperimentRecord', String(experiment));
                }
                if (input !== undefined) {
                    url.searchParams.set('includeInputRecord', String(input));
                }
                vi.mocked(getUserExperimentHistory).mockClear();
                await GET(new NextRequest(url), { params: Promise.resolve({ id: 'sample' }) });
                expect(getUserExperimentHistory).toHaveBeenCalledWith(
                    'sample',
                    '1',
                    experiment ?? true,
                    input ?? true
                );
            });
        }
    }
});
