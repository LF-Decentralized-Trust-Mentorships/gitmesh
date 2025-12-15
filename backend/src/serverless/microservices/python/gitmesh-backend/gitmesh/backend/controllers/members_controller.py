from gitmesh.backend.models import Member
from gitmesh.backend.repository import Repository
from gitmesh.backend.controllers import BaseController
from gitmesh.backend.infrastructure.logging import get_logger
from uuid import UUID
from gitmesh.backend.enums import Operations
from gitmesh.backend.repository.keys import DBKeys as dbk

logger = get_logger(__name__)


class MembersController(BaseController):
    """
    Controller for members in gitmesh.dev.
    It can add or update members, detect members to merge and do the merge, and mark members as not merging.

    Args:
        BaseController (BaseController): parent BaseController class.
    """

    def __init__(self, tenant_id: "UUID", repository: "Repository" = False, test: "bool" = False) -> "None":
        super().__init__(tenant_id, repository=repository, test=test)

    def update_members_to_merge(self, to_merge, send=True):
        """
        Function to update members to merge

        Args:
            to_merge ([tuple]): list of tuples
        """
        return self.sqs.send_message(self.tenant_id, Operations.UPDATE_MEMBERS_TO_MERGE, to_merge, send)

    def update(self, updates, send=True):
        """
        Function to update the integrations

        Args:
            updates ([{id, update}]): list of dicts with id and corresponding update
        """
        if type(updates) is not list:
            updates = [
                updates,
            ]
        return self.sqs.send_message(self.tenant_id, Operations.UPDATE_MEMBERS, updates, send)
