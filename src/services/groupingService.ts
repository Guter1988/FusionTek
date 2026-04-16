import { GroupRepository } from '../repositories/groupRepository.js';

export class GroupingService {
  private groupRepository = new GroupRepository();

  /**
   * Deterministically maps a canonical label to a group.
   * Normalizes the label to ensure stability across languages/phrasings.
   */
  async getOrCreateGroup(label: string): Promise<number> {
    const canonicalKey = label.toLowerCase().trim()
      .replace(/\s+/g, '_')
      .replace(/[^\w\u00C0-\u017F]/gu, ''); // Keep unicode characters but remove symbols

    const existingGroup = await this.groupRepository.findByCanonicalKey(canonicalKey);
    if (existingGroup) {
      return existingGroup.id;
    }

    const newGroup = await this.groupRepository.create(label, canonicalKey);
    return newGroup.id;
  }
}
