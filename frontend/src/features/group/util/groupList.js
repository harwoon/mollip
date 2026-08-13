const DEFAULT_GROUP_COLOR = "#a8a8b3"


function normalizeGroupName(value) {
    return String(value || "").replace(/\s/g, "")
}


export function prepareGroupList(
    groups,
    dormantGroupId,
    currentGroupId
) {
    if (!Array.isArray(groups)) {
        return []
    }

    return groups
        .filter((group) => {
            const matchesDormantId =
                dormantGroupId &&
                String(group?._id) === String(dormantGroupId)

            return (
                !matchesDormantId &&
                normalizeGroupName(group?.groupName) !== "휴면그룹"
            )
        })
        .map((group) => {
            const groupTime = Number(group?.groupTime)

            return {
                id: String(group?._id || group?.groupName || ""),
                name: String(group?.groupName || "이름 없는 그룹"),
                color: String(group?.groupColor || DEFAULT_GROUP_COLOR),
                hours:
                    Number.isFinite(groupTime) && groupTime > 0
                        ? groupTime / 3600
                        : 0,
                isCurrent:
                    Boolean(currentGroupId) &&
                    String(group?._id) === String(currentGroupId)
            }
        })
        .sort((first, second) => second.hours - first.hours)
}
